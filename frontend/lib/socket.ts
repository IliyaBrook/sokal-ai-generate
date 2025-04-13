import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const getSocketURL = (): string => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  console.log('🔌 Base Socket URL:', baseURL);
  return baseURL;
};

export const socket: Socket = io(getSocketURL() + '/post-edit', {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
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
  const socketUrl = getSocketURL() + '/post-edit';
  
  console.log(`🔍 Socket connection info:
  - Socket URL: ${socketUrl}
  - Connected: ${socket.connected}
  - ID: ${socket.id || 'not connected'}`);

  if (!socket.connected) {
    console.log(`🔌 Connecting to ${socketUrl}...`);
    socket.connect();
    
    setTimeout(() => {
      console.log(`🔍 Socket connection status:
      - Connected: ${socket.connected}
      - Socket ID: ${socket.id || 'no id'}`);
      
      if (!socket.connected) {
        console.error('🔴 Socket failed to connect within timeout!');
      }
    }, 2000);
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
