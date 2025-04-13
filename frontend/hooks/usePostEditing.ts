import { UserDataContext } from '@/contexts/UserData.context';
import {
  connectSocket,

  joinPostEditing,
  leavePostEditing,
  socket
} from '@/lib/socket';
import { IPost } from '@sokal_ai_generate/shared-types';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuthUserFetch, useDebounce } from '@/hooks';

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
        console.log("🔄 Initial content changed, updating state.");
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
        console.warn('Invalid watcher format:', watcher);
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

    const result = Array.from(uniqueWatchersMap.values());
    return result;
  }, []);

  useEffect(() => {
    const onConnect = () => {
      console.log('🎯 Socket connected in usePostEditing!', socket.id);
      setIsConnected(true);
      if (postId && isMountedRef.current) { 
        console.log('🚪 Re-joining post room after connect:', postId);
        joinPostEditing(postId, user);
      }
    };

    const onDisconnect = (reason: string) => {
      console.log('🔌 Socket disconnected in usePostEditing:', reason);
      setIsConnected(false);
      setActiveWatchers([]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setIsConnected(socket.connected);

    console.log('🔄 Setting up connect/disconnect listeners. Current state:',
        socket.connected ? 'connected' : 'disconnected',
        'ID:', socket.id);

    if (autoConnect) {
      if (!socket.connected) {
        console.log('🔄 Auto connecting to socket...');
        connectSocket();
      }
      if (socket.connected && postId) {
         console.log('🚪 Auto joining post room:', postId);
         joinPostEditing(postId, user);
      }
    }

    return () => {
      console.log('🧹 Cleaning up connect/disconnect listeners.');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      if (autoConnect && postId && socket.connected) {
         console.log(`🚪 Leaving post room on unmount: ${postId}`);
         leavePostEditing(postId, user);
      }
    };
  }, [postId, user, autoConnect]);

  useEffect(() => {
    if (!isMountedRef.current) return;

    const onJoinPostResponse = (data: { editors?: string[], content?: string }) => {
      console.log('📣 Received join-post-response:', data);
      if (data.editors) {
        setActiveWatchers(parseWatchers(data.editors));
      }
      if (data.content && data.content !== content) {
        console.log('📝 Updating content from join response:', data.content.substring(0, 30) + '...');
        isUpdatingFromSocketRef.current = true;
        setContent(data.content);
      }
    };

    const onContentUpdated = (data: { content: string, userId: string, clientId: string }) => {
      if (data.clientId === socket.id) {
          console.log('📝 Ignoring self-echoed content-updated');
          return;
      }

      console.log('📝 Received content-updated from other client:', data.clientId, data.content?.substring(0, 30) + '...');
      if (data.content && data.content !== content) {
        isUpdatingFromSocketRef.current = true; 
        setContent(data.content);
      } else {
        console.log('📝 Received content is same as current or empty, skipping update.');
      }
    };

    const onEditorsUpdated = (editorsData: string[]) => {
      console.log('👀 Received editors update:', editorsData);
      setActiveWatchers(parseWatchers(editorsData));
    };

    const onSaveContentResponse = (data: { success: boolean, error?: string }) => {
      console.log('💾 Received save-content-response:', data);
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
      console.log('📌 Received content-saved:', data);
      toast.info(`Post saved by another user at ${new Date(data.timestamp).toLocaleTimeString()}`);
    };

    socket.on('join-post-response', onJoinPostResponse);
    socket.on('content-updated', onContentUpdated);
    socket.on('editors', onEditorsUpdated);
    socket.on('save-content-response', onSaveContentResponse);
    socket.on('content-saved', onContentSaved);

    return () => {
      console.log(`🎧 Unregistering socket event listeners for post: ${postId.substring(postId.length - 6)}`);
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
            console.log("🚩 Resetting socket update flag");
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
    console.log('🔌 Manual connect requested');
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
