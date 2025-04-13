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
  // Используем ref для initialContent, чтобы избежать лишних перезапусков эффектов
  const initialContentRef = useRef(initialContent);
  const [content, setContent] = useState(initialContentRef.current);
  const debouncedContent = useDebounce(content, 500); // Дебаунс для отправки
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSaving, setIsSaving] = useState(false);
  const [activeWatchers, setActiveWatchers] = useState<Watcher[]>([]);
  const contextData = useContext(UserDataContext);
  const user = contextData?.userData;
  const saveResolverRef = useRef<((value: boolean) => void) | null>(null);
  const apiFetch = useAuthUserFetch();
  const isMountedRef = useRef(false); // Отслеживаем монтирование
  const isUpdatingFromSocketRef = useRef(false); // Флаг для предотвращения эха

  // Логирование инициализации хука
  useEffect(() => {
    console.log('🔄 usePostEditing init:', {
      postId: postId.substring(postId.length - 6),
      initialContent: initialContentRef.current?.substring(0, 30) + '...',
      autoConnect
    });
    isMountedRef.current = true;

    // Устанавливаем начальное содержимое, если оно изменилось (например, при смене поста)
    // Сравниваем с ref, чтобы избежать установки того же значения
    if (initialContent !== initialContentRef.current) {
        console.log("🔄 Initial content changed, updating state.");
        initialContentRef.current = initialContent;
        setContent(initialContent);
    }


    return () => {
      isMountedRef.current = false;
    };
  // Не добавляем initialContent в зависимости, используем ref
  }, [postId, autoConnect]);

  const parseWatchers = useCallback((watchersData: string[]) => {
    // console.log('Parsing watchers data:', watchersData);
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
    // console.log('Parsed watchers:', result);
    return result;
  }, []);

  // --- Эффект для управления подключением к сокету ---
  useEffect(() => {
    const onConnect = () => {
      console.log('🎯 Socket connected in usePostEditing!', socket.id);
      setIsConnected(true);
      // Повторно присоединяемся к комнате после восстановления соединения
      if (postId && isMountedRef.current) { // Проверяем монтирование
        console.log('🚪 Re-joining post room after connect:', postId);
        joinPostEditing(postId, user);
      }
    };

    const onDisconnect = (reason: string) => {
      console.log('🔌 Socket disconnected in usePostEditing:', reason);
      setIsConnected(false);
      setActiveWatchers([]); // Сбрасываем список редакторов при дисконнекте
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // Устанавливаем начальное состояние подключения
    setIsConnected(socket.connected);

    console.log('🔄 Setting up connect/disconnect listeners. Current state:',
        socket.connected ? 'connected' : 'disconnected',
        'ID:', socket.id);

    // Автоматическое подключение/присоединение
    if (autoConnect) {
      if (!socket.connected) {
        console.log('🔄 Auto connecting to socket...');
        connectSocket(); // connectSocket сама проверит, нужно ли подключаться
      }
      // Присоединяемся, если сокет уже подключен или только что подключился (onConnect сработает)
      if (socket.connected && postId) {
         console.log('🚪 Auto joining post room:', postId);
         joinPostEditing(postId, user);
      }
    }

    return () => {
      console.log('🧹 Cleaning up connect/disconnect listeners.');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // Отключаемся от комнаты при размонтировании хука, если autoConnect был включен
      if (autoConnect && postId && socket.connected) {
         console.log(`🚪 Leaving post room on unmount: ${postId}`);
         leavePostEditing(postId, user);
      }
    };
  // Зависимости: postId, user (если изменится), autoConnect
  }, [postId, user, autoConnect]); // Убрали parseWatchers, т.к. он useCallback

  // --- Эффект для обработки событий сокета ---
  useEffect(() => {
    // Не выполняем, если хук не смонтирован
    if (!isMountedRef.current) return;

    const onJoinPostResponse = (data: { editors?: string[], content?: string }) => {
      console.log('📣 Received join-post-response:', data);
      if (data.editors) {
        setActiveWatchers(parseWatchers(data.editors));
      }
      // Обновляем контент, если он пришел и отличается от текущего
      // Используем ref для сравнения с самым последним состоянием
      if (data.content && data.content !== content) {
        console.log('📝 Updating content from join response:', data.content.substring(0, 30) + '...');
        isUpdatingFromSocketRef.current = true; // Ставим флаг перед обновлением
        setContent(data.content);
      }
    };

    const onContentUpdated = (data: { content: string, userId: string, clientId: string }) => {
      // Игнорируем обновление, если оно пришло от нашего же клиента (эхо)
      // Сравниваем clientId, так как userId может быть одинаковым (anonymous)
      if (data.clientId === socket.id) {
          console.log('📝 Ignoring self-echoed content-updated');
          return;
      }

      console.log('📝 Received content-updated from other client:', data.clientId, data.content?.substring(0, 30) + '...');
      if (data.content && data.content !== content) { // Сравниваем с текущим состоянием
        isUpdatingFromSocketRef.current = true; // Ставим флаг перед обновлением
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
        saveResolverRef.current = null; // Очищаем ref после использования
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

    // Регистрируем обработчики
    console.log(`🎧 Registering socket event listeners for post: ${postId.substring(postId.length - 6)}`);
    socket.on('join-post-response', onJoinPostResponse);
    socket.on('content-updated', onContentUpdated);
    socket.on('editors', onEditorsUpdated);
    socket.on('save-content-response', onSaveContentResponse);
    socket.on('content-saved', onContentSaved);

    return () => {
      // Снимаем обработчики при размонтировании или изменении postId/user
      console.log(`🎧 Unregistering socket event listeners for post: ${postId.substring(postId.length - 6)}`);
      socket.off('join-post-response', onJoinPostResponse);
      socket.off('content-updated', onContentUpdated);
      socket.off('editors', onEditorsUpdated);
      socket.off('save-content-response', onSaveContentResponse);
      socket.off('content-saved', onContentSaved);
    };
  // Зависимости: postId, user, parseWatchers (useCallback)
  // Убрали content!
  }, [postId, user, parseWatchers]);

  // --- Эффект для отправки обновлений контента через сокет ---
  useEffect(() => {
    // Не отправляем, если хук не смонтирован или если обновление пришло от сокета
    if (!isMountedRef.current || isUpdatingFromSocketRef.current) {
        // Сбрасываем флаг после пропуска отправки
        if (isUpdatingFromSocketRef.current) {
            console.log("🚩 Resetting socket update flag");
            isUpdatingFromSocketRef.current = false;
        }
        return;
    }

    // Не отправляем начальный контент или если контент не изменился с момента последнего дебаунса
    if (debouncedContent === initialContentRef.current && content === initialContentRef.current) {
      // console.log('🖋️ Skipping initial/unchanged content send');
      return;
    }

    if (socket.connected && postId) {
      const userId = user?.id || `anonymous-${socket.id}`;
      const userName = user ? `${user.firstname} ${user.lastname}`.trim() : '';

      console.log('📤 Sending content-update via socket:', debouncedContent?.substring(0, 30) + '...');
      socket.emit('content-update', {
        postId,
        content: debouncedContent, // Отправляем дебаунсированное значение
        userId,
        userName,
        clientId: socket.id // Отправляем ID клиента для предотвращения эха
      });
      // Обновляем ref после отправки, чтобы следующее сравнение было корректным
      // initialContentRef.current = debouncedContent; // Возможно, это не нужно, т.к. initialContentRef - для начального значения
    } else {
       console.warn('📤 Socket not connected, cannot send content update.');
    }
  // Зависимость от debouncedContent гарантирует отправку после паузы
  }, [debouncedContent, postId, user, isConnected]); // Добавили isConnected

  // Функция для ручного подключения
  const connect = useCallback(() => {
    console.log('🔌 Manual connect requested');
    connectSocket(); // Функция connectSocket сама проверит, нужно ли подключаться
    // Присоединение произойдет автоматически в эффекте управления подключением, если autoConnect=true,
    // или нужно будет вызвать joinPostEditing отдельно, если autoConnect=false
    if (!autoConnect && postId && socket.connected) {
        console.log('🚪 Manually joining post room after connect:', postId);
        joinPostEditing(postId, user);
    } else if (!autoConnect && postId && !socket.connected) {
        // Если сокет не подключен, joinPostEditing вызовет connectSocket и присоединится позже
        console.log('🚪 Manually joining post room (will connect first):', postId);
        joinPostEditing(postId, user);
    }
  }, [postId, user, autoConnect]);

  // Функция для ручного отключения
  const disconnect = useCallback(() => {
    if (socket.connected && postId) {
      console.log(`🚪 Leaving post room manually: ${postId}`);
      leavePostEditing(postId, user);
      // Можно также полностью отключить сокет, если он больше не нужен
      // disconnectSocket();
    }
  }, [postId, user]);

  // Функция для обновления контента извне (например, из RichTextEditor)
  const updateContent = useCallback((newContent: string) => {
    // console.log('🖊️ updateContent called with:', newContent?.substring(0, 30) + '...');
    // Не ставим флаг isUpdatingFromSocketRef.current = false здесь,
    // он сбрасывается в эффекте отправки контента
    setContent(newContent);
  }, []);

  // Функция для сохранения контента
  const saveContent = useCallback(async (): Promise<boolean> => {
    const userId = user?.id || `anonymous-${socket.id}`;
    setIsSaving(true);

    // Попытка через сокет
    if (socket.connected) {
      console.log('💾 Requesting save via socket...');
      return new Promise<boolean>((resolve) => {
        saveResolverRef.current = resolve; // Сохраняем резолвер для ответа от сокета

        socket.emit('save-content', {
          postId,
          content, // Отправляем текущее, не дебаунсированное значение
          userId,
          clientId: socket.id
        });

        // Таймаут для операции сохранения
        const timeoutId = setTimeout(() => {
          if (saveResolverRef.current) {
            console.error('💾 Save operation timed out via socket.');
            toast.error('Save operation timed out');
            setIsSaving(false);
            saveResolverRef.current(false); // Резолвим промис как false
            saveResolverRef.current = null;
          }
        }, 10000); // Увеличил таймаут до 10 секунд

        // Очистка таймаута, если ответ пришел раньше
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

    // Фолбэк через HTTP, если сокет не подключен
    console.log('💾 Socket not connected, using HTTP fallback to save...');
    try {
      const response = await apiFetch<{ success: boolean; message?: string; post?: IPost }>(`/api/posts/${postId}/save`, { // Предполагаем отдельный эндпоинт для сохранения
        method: 'PUT',
        body: JSON.stringify({ content }), // Отправляем текущий контент
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
  }, [postId, content, user, apiFetch, isConnected]); // Добавили isConnected

  // console.log('🔄 usePostEditing render. Content:', content?.substring(0, 30) + '...');

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
