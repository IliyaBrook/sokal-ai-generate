import { UserDataContext } from '@/contexts/UserData.context'
import { useAuthUserFetch, useDebounce } from '@/hooks'
import { connectSocket, joinPostEditing, leavePostEditing, socket } from '@/lib/socket'
import { IPost } from '@sokal_ai_generate/shared-types'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface UsePostEditingOptions {
  postId: string;
  initialContent: string;
  autoConnect?: boolean;
}

export interface Watcher {
  userId: string;
  clientId: string;
  username?: string;
}

export function usePostEditing({
  postId,
  initialContent,
  autoConnect = false,
}: UsePostEditingOptions) {
  const initialContentRef = useRef(initialContent);
  const [content, setContent] = useState(initialContentRef.current);
  const debouncedContent = useDebounce(content, 500);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSaving, setIsSaving] = useState(false);
  const [activeWatchers, setActiveWatchers] = useState<Watcher[]>([]);
  const contextData = useContext(UserDataContext);
  const user = contextData?.userData;
  const saveResolverRef = useRef<((value: boolean) => void) | null>(null);
  const apiFetch = useAuthUserFetch();
  const isMountedRef = useRef(false);
  const isUpdatingFromSocketRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    if (initialContent !== initialContentRef.current) {
        initialContentRef.current = initialContent;
        setContent(initialContent);
    }


    return () => {
      isMountedRef.current = false;
    };
  }, [postId, autoConnect]);

  const parseWatchers = useCallback((watchersData: string[]) => {
    const uniqueWatchersMap = new Map<string, Watcher>();

    watchersData.forEach((watcher) => {
      const parts = watcher.split(':');
      if (parts.length < 2) {
        return;
      }

      const userId = parts[0];
      const clientId = parts[1];
      const userName = parts.length > 2 ? parts[2] : undefined;
      const uniqueKey = `${userId}:${clientId}`;
      const isAnonymous = userId.startsWith('anonymous-');

      uniqueWatchersMap.set(uniqueKey, {
        userId,
        clientId,
        username: isAnonymous ? undefined : userName
      });
    });

    return Array.from(uniqueWatchersMap.values());
  }, []);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      if (postId && isMountedRef.current) { 
        joinPostEditing(postId, user);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setActiveWatchers([]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setIsConnected(socket.connected);

    if (autoConnect) {
      if (!socket.connected) {
        connectSocket();
      }
      if (socket.connected && postId) {
         joinPostEditing(postId, user);
      }
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      if (autoConnect && postId && socket.connected) {
         leavePostEditing(postId, user);
      }
    };
  }, [postId, user, autoConnect]);

  useEffect(() => {
    if (!isMountedRef.current) return;

    const onJoinPostResponse = (data: { editors?: string[], content?: string }) => {
      if (data.editors) {
        setActiveWatchers(parseWatchers(data.editors));
      }
      if (data.content && data.content !== content) {
        isUpdatingFromSocketRef.current = true;
        setContent(data.content);
      }
    };

    const onContentUpdated = (data: { content: string, userId: string, clientId: string }) => {
      if (data.clientId === socket.id) {
          return;
      }

      if (data.content && data.content !== content) {
        isUpdatingFromSocketRef.current = true; 
        setContent(data.content);
      } else {
        console.log('📝 Received content is same as current or empty, skipping update.');
      }
    };

    const onEditorsUpdated = (editorsData: string[]) => {
      setActiveWatchers(parseWatchers(editorsData));
    };

    const onSaveContentResponse = (data: { success: boolean, error?: string }) => {
      setIsSaving(false);
      if (saveResolverRef.current) {
        saveResolverRef.current(data.success);
        saveResolverRef.current = null;
      }
      if (data.success) {
        toast.success('Post saved successfully');
      } else {
        toast.error(`Failed to save: ${data.error || 'Unknown error'}`);
      }
    };

    const onContentSaved = (data: { timestamp: string }) => {
      toast.info(`Post saved by another user at ${new Date(data.timestamp).toLocaleTimeString()}`);
    };

    socket.on('join-post-response', onJoinPostResponse);
    socket.on('content-updated', onContentUpdated);
    socket.on('editors', onEditorsUpdated);
    socket.on('save-content-response', onSaveContentResponse);
    socket.on('content-saved', onContentSaved);

    return () => {
      socket.off('join-post-response', onJoinPostResponse);
      socket.off('content-updated', onContentUpdated);
      socket.off('editors', onEditorsUpdated);
      socket.off('save-content-response', onSaveContentResponse);
      socket.off('content-saved', onContentSaved);
    };
  }, [postId, user, parseWatchers]);

  useEffect(() => {
    if (!isMountedRef.current || isUpdatingFromSocketRef.current) {
        if (isUpdatingFromSocketRef.current) {
            isUpdatingFromSocketRef.current = false;
        }
        return;
    }

    if (debouncedContent === initialContentRef.current && content === initialContentRef.current) {
      return;
    }

    if (socket.connected && postId) {
      const userId = user?.id || `anonymous-${socket.id}`;
      const userName = user ? `${user.firstname} ${user.lastname}`.trim() : '';

      console.log('📤 Sending content-update via socket:', debouncedContent?.substring(0, 30) + '...');
      socket.emit('content-update', {
        postId,
        content: debouncedContent,
        userId,
        userName,
        clientId: socket.id
      });
    } else {
       console.warn('📤 Socket not connected, cannot send content update.');
    }
  }, [debouncedContent, postId, user, isConnected]);

  const connect = useCallback(() => {
    connectSocket();
    if (!autoConnect && postId && socket.connected) {
        console.log('🚪 Manually joining post room after connect:', postId);
        joinPostEditing(postId, user);
    } else if (!autoConnect && postId && !socket.connected) {
        console.log('🚪 Manually joining post room (will connect first):', postId);
        joinPostEditing(postId, user);
    }
  }, [postId, user, autoConnect]);


  const disconnect = useCallback(() => {
    if (socket.connected && postId) {
      console.log(`🚪 Leaving post room manually: ${postId}`);
      leavePostEditing(postId, user);
    }
  }, [postId, user]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const saveContent = useCallback(async (): Promise<boolean> => {
    const userId = user?.id || `anonymous-${socket.id}`;
    setIsSaving(true);

    if (socket.connected) {
      console.log('💾 Requesting save via socket...');
      return new Promise<boolean>((resolve) => {
        saveResolverRef.current = resolve;

        socket.emit('save-content', {
          postId,
          content, 
          userId,
          clientId: socket.id
        });

        const timeoutId = setTimeout(() => {
          if (saveResolverRef.current) {
            console.error('💾 Save operation timed out via socket.');
            toast.error('Save operation timed out');
            setIsSaving(false);
            saveResolverRef.current(false);
            saveResolverRef.current = null;
          }
        }, 10000);

        const originalResolver = saveResolverRef.current;
        saveResolverRef.current = (success: boolean) => {
            clearTimeout(timeoutId);
            originalResolver(success);
        };

      }).catch(error => {
          console.error("Error in save promise:", error);
          setIsSaving(false);
          return false;
      });
    }

    console.log('💾 Socket not connected, using HTTP fallback to save...');
    try {
      const response = await apiFetch<{ success: boolean; message?: string; post?: IPost }>(`/api/posts/${postId}/save`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      if (response?.success) {
        toast.success('Post saved successfully (HTTP fallback)');
        setIsSaving(false);
        return true;
      } else {
        toast.error(`Failed to save (HTTP): ${response?.message || 'Unknown error'}`);
        setIsSaving(false);
        return false;
      }
    } catch (error) {
      console.error('Error saving via HTTP fallback:', error);
      toast.error('Failed to save post (HTTP)');
      setIsSaving(false);
      return false;
    }
  }, [postId, content, user, apiFetch, isConnected]); 


  return {
    content,
    updateContent,
    saveContent,
    isConnected,
    isSaving,
    activeWatchers,
    connect,
    disconnect,
  };
}
