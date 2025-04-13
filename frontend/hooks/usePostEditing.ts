import { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { toast } from 'sonner';
import { 
  socket, 
  connectSocket, 
  disconnectSocket, 
  joinPostEditing,
  leavePostEditing
} from '../lib/socket';
import { useAuthUserFetch } from './useAuthUserFetch';
import { IPost } from '@sokal_ai_generate/shared-types';
import { useDebounce } from './useDebounce';
import { UserDataContext } from '../contexts/UserData.context';

interface UsePostEditingOptions {
  postId: string;
  initialContent: string;
  autoConnect?: boolean;
}

export interface Watcher {
  userId: string;
  clientId: string;
  userName?: string;
}

// Флаг для отслеживания регистрации событий
let eventsRegistered = false;

export function usePostEditing({ 
  postId, 
  initialContent, 
  autoConnect = false,
}: UsePostEditingOptions) {
  const [content, setContent] = useState(initialContent);
  const debouncedContent = useDebounce(content, 500);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSaving, setIsSaving] = useState(false);
  const [activeWatchers, setActiveWatchers] = useState<Watcher[]>([]);
  const contextData = useContext(UserDataContext);
  const user = contextData?.userData;
  const contentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveResolverRef = useRef<((value: boolean) => void) | null>(null);
  const effectCleanupRef = useRef(false);
  const apiFetch = useAuthUserFetch();
  
  // Логирование инициализации хука
  useEffect(() => {
    console.log('🔄 usePostEditing init:', {
      postId: postId.substring(postId.length - 6),
      initialContent: initialContent?.substring(0, 30) + '...',
      autoConnect
    });
    // Устанавливаем начальное содержимое
    setContent(initialContent);
  }, [postId, initialContent, autoConnect]);

  const parseWatchers = useCallback((watchersData: string[]) => {
    const uniqueWatchersMap = new Map<string, {userId: string, clientId: string, userName?: string}>();
    
    watchersData.forEach((watcher) => {
      const parts = watcher.split(':');
      const userId = parts[0];
      const clientId = parts[1];
      const userName = parts.length > 2 ? parts[2] : undefined;
      
      // Создаем уникальный ключ на основе комбинации userId и clientId
      const uniqueKey = `${userId}:${clientId}`;
      
      // Добавляем в Map, автоматически исключая дубликаты
      uniqueWatchersMap.set(uniqueKey, { userId, clientId, userName });
    });
    
    // Преобразуем Map в массив объектов
    return Array.from(uniqueWatchersMap.values());
  }, []);

  useEffect(() => {
    const onConnect = () => {
      console.log('🎯 Socket connected in usePostEditing!', socket.id);
      setIsConnected(true);
    };

    const onDisconnect = (reason: string) => {
      console.log('🔌 Socket disconnected in usePostEditing:', reason);
      setIsConnected(false);
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setIsConnected(socket.connected);
    
    // Логируем текущее состояние
    console.log('🔄 Current socket state in usePostEditing:', 
      socket.connected ? 'connected' : 'disconnected', 
      'ID:', socket.id);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Управление событиями сокета
  useEffect(() => {
    if (effectCleanupRef.current) return;
    
    // Снимаем все обработчики перед установкой новых
    if (eventsRegistered) {
      socket.off('join-post-response');
      socket.off('content-updated');
      socket.off('editors');
      socket.off('save-content-response');
      socket.off('content-saved');
    }
    
    const onJoinPostResponse = (data: any) => {
      console.log('📣 Received join-post-response:', data);
      if (data.editors) {
        setActiveWatchers(parseWatchers(data.editors));
      }
    };
    
    const onContentUpdated = (data: any) => {
      console.log('📝 Received content-updated:', data);
      // Принимаем контент от всех пользователей
      if (data.content) {
        console.log(`📝 Setting content from ${data.userId || 'unknown'}`);
        setContent(data.content);
      }
    };

    const onEditorsUpdated = (data: any) => {
      console.log('👀 Received editors update:', data);
      setActiveWatchers(parseWatchers(data));
    };
    
    const onSaveContentResponse = (data: any) => {
      console.log('💾 Received save-content-response:', data);
      setIsSaving(false);
      
      if (data.success) {
        toast.success('Post saved successfully');
        if (saveResolverRef.current) {
          saveResolverRef.current(true);
          saveResolverRef.current = null;
        }
      } else {
        toast.error(`Failed to save: ${data.error || 'Unknown error'}`);
        if (saveResolverRef.current) {
          saveResolverRef.current(false);
          saveResolverRef.current = null;
        }
      }
    };

    const onContentSaved = (data: any) => {
      console.log('📌 Received content-saved:', data);
      toast.success(`Post saved at ${new Date(data.timestamp).toLocaleTimeString()}`);
    };

    // Регистрируем обработчики событий
    socket.on('join-post-response', onJoinPostResponse);
    socket.on('content-updated', onContentUpdated);
    socket.on('editors', onEditorsUpdated);  // используем editors вместо watchers в соответствии с бэкендом
    socket.on('save-content-response', onSaveContentResponse);
    socket.on('content-saved', onContentSaved);
    
    eventsRegistered = true;

    // Автоматическое подключение при создании хука
    if (autoConnect && !socket.connected) {
      console.log('🔄 Auto connecting to socket...');
      connectSocket();
      if (postId) {
        console.log('🚪 Joining post room:', postId);
        joinPostEditing(postId, user);
      }
    }

    return () => {
      effectCleanupRef.current = true;      
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
      }
      
      if (postId && socket.connected) {
        leavePostEditing(postId, user);
      }
      
      socket.off('join-post-response', onJoinPostResponse);
      socket.off('content-updated', onContentUpdated);
      socket.off('editors', onEditorsUpdated);
      socket.off('save-content-response', onSaveContentResponse);
      socket.off('content-saved', onContentSaved);
      
      eventsRegistered = false;
    };
  }, [postId, autoConnect, user, parseWatchers]);

  // Отправка обновлений контента через сокет
  useEffect(() => {
    if (socket.connected && debouncedContent !== initialContent) {
      const userId = user?.id || `anonymous-${socket.id}`;
      console.log('Sending content update to server:', debouncedContent.substring(0, 30) + '...');
      socket.emit('content-update', {
        postId,
        content: debouncedContent,
        userId
      });
    }
  }, [debouncedContent, postId, user, initialContent]);

  // Функция для установки соединения и присоединения к комнате редактирования
  const connect = useCallback(() => {
    console.log('🔌 Manual connect requested');
    connectSocket();
    if (postId) {
      console.log('🚪 Joining post room:', postId);
      joinPostEditing(postId, user);
    }
  }, [postId, user]);

  // Функция для обновления контента внутри хука
  const updateContent = useCallback((newContent: string) => {
    console.log('🖊️ updateContent called with:', newContent.substring(0, 30) + '...');
    setContent(newContent);
  }, []);

  // Функция для сохранения контента в базу данных
  const saveContent = useCallback(async () => {
    const userId = user?.id || `anonymous-${socket.id}`;
    
    if (!socket.connected) {
      console.log('Socket not connected, using HTTP fallback to save');
      
      try {
        const data = await apiFetch<IPost & {message: string}>(`/api/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify({ content }),
        });
        if (data?.authorId) {
          toast.success('Post saved successfully (HTTP fallback)');
          return true;
        } else {
          toast.error(`Failed to save: ${data.message || 'Unknown error'}`);
          return false;
        }
      } catch (error) {
        console.error('Error saving via HTTP fallback:', error);
        toast.error('Failed to save post');
        return false;
      }
    }
    setIsSaving(true);
    
    try {
      return new Promise<boolean>((resolve) => {
        saveResolverRef.current = resolve;
        
        const data = {
          postId,
          content,
          userId
        };
        
        console.log('Sending save-content request via socket:', data.content.substring(0, 30) + '...');
        socket.emit('save-content', data);
        
        setTimeout(() => {
          if (saveResolverRef.current) {
            setIsSaving(false);
            toast.error('Save operation timed out');
            saveResolverRef.current(false);
            saveResolverRef.current = null;
          }
        }, 5000);
      });
    } catch (error) {
      console.error('Error saving content:', error);
      setIsSaving(false);
      toast.error('Failed to save post');
      return false;
    }
  }, [postId, content, user, apiFetch]);

  // Функция для отключения от сокета
  const disconnect = useCallback(() => {
    if (postId && socket.connected) {
      leavePostEditing(postId, user);
    }
    
    disconnectSocket();
  }, [postId, user]);

  // Логирование перед возвратом
  console.log('content in usePostEditing:', content?.substring(0, 30) + '...');
  
  return {
    content,
    updateContent,
    saveContent,
    isConnected,
    isSaving,
    activeWatchers,
    connect,
    disconnect
  };
} 