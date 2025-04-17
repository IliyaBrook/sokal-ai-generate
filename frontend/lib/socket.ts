import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'

const getSocketURL = (): string => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const hostname = window.location.hostname;
    const port = process.env.NODE_ENV === 'production' ? '4001' : '4000';
    
    return `${protocol}://${hostname}:${port}`;
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return apiUrl.replace('/api', '');
};

export const socket: Socket = io(getSocketURL(), {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  forceNew: true,
  path: '/socket.io'
});

socket.on('connect', () => {
  console.log(`🟢 Socket connected! ID: ${socket.id}`);
});

socket.on('connect_error', (error: Error) => {
  console.error('🔴 Socket connection error:', error.message, error);
});

socket.on('disconnect', (reason: string) => {
  console.log('🟠 Socket disconnected:', reason);
});

socket.on('reconnect_attempt', (attempt: number) => {
  console.log(`🔄 Socket reconnection attempt ${attempt}`);
});

socket.on('reconnect', (attempt: number) => {
  console.log(`🟢 Socket reconnected after ${attempt} attempts`);
});

socket.on('error', (error: Error) => {
  console.error('🔴 Socket error:', error);
});

socket.on('duplicate-connection', (data) => {
  console.warn('🔴 Duplicate connection detected:', data.message);
  toast.warning('You have connected from another window. This session will be disconnected.');
  
  setTimeout(() => {
    window.location.href = '/';
  }, 3000);
});

export const connectSocket = () => {
  if (!socket.connected) {
    try {
      socket.io.opts.transports = ['websocket', 'polling'];
      socket.io.opts.extraHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      };
      socket.connect();
      
      setTimeout(() => {
        console.log(`🔍 Socket connection status:
        - Connected: ${socket.connected}
        - Socket ID: ${socket.id || 'no id'}`);
        
        if (!socket.connected) {
          console.error('🔴 Socket failed to connect within timeout! Trying again with polling only...');
          socket.io.opts.transports = ['polling'];
          socket.connect();
          
          setTimeout(() => {
            if (!socket.connected) {
              console.error('🔴 Socket still failed to connect. Please check network settings.');
              toast.error('Failed to connect to editing server. Please refresh the page.');
            }
          }, 3000);
        }
      }, 2000);
    } catch (error) {
      console.error('🔴 Socket connection error:', error);
    }
  } else {
    console.log('Socket already connected, id:', socket.id);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
  } else {
    console.log('Socket already disconnected');
  }
};

export const joinPostEditing = (postId: string, userData: any) => {
  if (!socket.connected) {
    console.log('Socket not connected, connecting before joining room');
    connectSocket();
    
    setTimeout(() => {
      if (socket.connected) {
        emitJoinPost(postId, userData);
      } else {
        console.error('🔴 Cannot join room: socket not connected after timeout');
      }
    }, 1000);
  } else {
    emitJoinPost(postId, userData);
  }
};

const emitJoinPost = (postId: string, userData: any) => {
  const user = userData?.userData || userData;
  const userId = user?.id || `anonymous-${socket.id}`;
  const firstName = user?.firstname || '';
  const lastName = user?.lastname || '';
  const userName = firstName && lastName ? `${firstName} ${lastName}`.trim() : user?.email || '';
  
  console.log(`🚪 Joining post editing room ${postId} as ${userName || 'Anonymous'} (${userId})`);
  
  try {
    socket.emit('join-post', {
      postId,
      userId,
      userName,
      user: {
        id: userId,
        firstname: firstName,
        lastname: lastName,
        email: user?.email
      }
    });
  } catch (error) {
    console.error('🔴 Error joining post room:', error);
  }
};

export const leavePostEditing = (postId: string, userData: any) => {
  const user = userData?.userData || userData;
  const userId = user?.id || `anonymous-${socket.id}`;
  
  if (socket.connected) {
    console.log(`🚪 Leaving post editing room: ${postId}`);
    socket.emit('leave-post', {
      postId,
      userId
    });
  } else {
    console.log(`Cannot leave room ${postId}: socket disconnected`);
  }
};
