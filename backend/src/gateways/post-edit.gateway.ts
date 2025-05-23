import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
  WsResponse
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { PostService } from '@/services';

interface EditPayload {
  postId: string;
  content: string;
  userId: string;
  userName?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST']
  },
  namespace: '',
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  allowEIO3: true
})
export class PostEditGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(PostEditGateway.name);
  private activeEditors: Map<string, Set<string>> = new Map();
  private userSocketsMap: Map<string, Set<string>> = new Map();

  constructor(private readonly postService: PostService) {}
  
  afterInit() {
    this.logger.log('Post edit websocket gateway initialized');
  }

  handleConnection(client: Socket) {
    const handshake = client.handshake;
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Connection from: ${handshake.address} via ${handshake.headers.origin || 'unknown'}`);
    this.logger.log(`Transport: ${client.conn.transport.name}`);
    this.logger.log(`Query params: ${JSON.stringify(handshake.query)}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.removeFromAllRooms(client);
    this.removeSocketFromUserMap(client.id);
  }
  
  private removeSocketFromUserMap(socketId: string) {
    Array.from(this.userSocketsMap.entries()).forEach(([userId, socketIds]) => {
      if (socketIds.has(socketId)) {
        socketIds.delete(socketId);
        if (socketIds.size === 0) {
          this.userSocketsMap.delete(userId);
        }
      }
    });
  }

  private removeFromAllRooms(client: Socket) {
    // Iterate through all rooms and remove this client
    Array.from(this.activeEditors.entries()).forEach(([postId, editors]) => {
      const editorInfo = Array.from(editors).find(info => info.includes(client.id));
      if (editorInfo) {
        editors.delete(editorInfo);
        if (editors.size === 0) {
          this.activeEditors.delete(postId);
        } else {
          this.server.to(`post:${postId}`).emit('editors', Array.from(editors));
        }
      }
    });
  }

  private disconnectPreviousUserSessions(userId: string, postId: string, currentClientId: string) {
    if (userId.startsWith('anonymous-')) {
      return;
    }
    
    const userSockets = this.userSocketsMap.get(userId);
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach(socketId => {
        if (socketId !== currentClientId) {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('duplicate-connection', {
              message: 'You have connected from another window. This session will be disconnected.'
            });
            
            socket.leave(`post:${postId}`);
            
            const editors = this.activeEditors.get(postId);
            if (editors) {
              const editorInfoToRemove = Array.from(editors).find(info => info.includes(socketId));
              if (editorInfoToRemove) {
                editors.delete(editorInfoToRemove);
                if (editors.size === 0) {
                  this.activeEditors.delete(postId);
                }
              }
            }
            
            const userSocketsSet = this.userSocketsMap.get(userId);
            if (userSocketsSet) {
              userSocketsSet.delete(socketId);
            }
          }
        }
      });
      
      const editors = this.activeEditors.get(postId);
      if (editors) {
        this.server.to(`post:${postId}`).emit('editors', Array.from(editors));
      }
    }
  }

  @SubscribeMessage('join-post')
  handleJoinPost(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { postId: string; userId: string; userName?: string }
  ): WsResponse<any> {
    const { postId, userId, userName } = payload;
    this.logger.log(`User ${userId} joined post ${postId}`);
    
    this.disconnectPreviousUserSessions(userId, postId, client.id);
    
    if (!this.userSocketsMap.has(userId)) {
      this.userSocketsMap.set(userId, new Set());
    }
    this.userSocketsMap.get(userId)?.add(client.id);
    
    // Join the room for this post
    client.join(`post:${postId}`);
    // Add to active editors
    if (!this.activeEditors.has(postId)) {
      this.activeEditors.set(postId, new Set());
    }
    
    const editors = this.activeEditors.get(postId);
    if (editors) {
      const editorId = `${userId}:${client.id}${userName ? `:${userName}` : ''}`;
      editors.add(editorId);
      
      // Notify all clients about active editors
      this.server.to(`post:${postId}`).emit('editors', Array.from(editors));
    }
    
    return { event: 'join-post-response', data: { success: true, editors: Array.from(editors || []) } };
  }

  @SubscribeMessage('leave-post')
  handleLeavePost(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { postId: string; userId: string }
  ): WsResponse<any> {
    const { postId, userId } = payload;
    this.logger.log(`User ${userId} left post ${postId}`);
    
    // Leave the room
    client.leave(`post:${postId}`);
    
    // Remove from active editors
    const editors = this.activeEditors.get(postId);
    if (editors) {
      const editorToRemove = Array.from(editors).find(id => id.startsWith(`${userId}:`));
      if (editorToRemove) {
        editors.delete(editorToRemove);
      }
      
      if (editors.size === 0) {
        this.activeEditors.delete(postId);
      } else {
        this.server.to(`post:${postId}`).emit('editors', Array.from(editors));
      }
    }
    
    return { event: 'leave-post-response', data: { success: true } };
  }

  @SubscribeMessage('content-update')
  async handleContentUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: EditPayload
  ): Promise<WsResponse<any>> {
    const { postId, content, userId } = payload;
    this.logger.log(`Content update from user ${userId} for post ${postId}`);
    
    // Broadcast the content update to all clients in the room except the sender
    client.to(`post:${postId}`).emit('content-updated', { content, userId });
    
    return { event: 'content-update-response', data: { success: true } };
  }

  @SubscribeMessage('save-content')
  async handleSaveContent(
    @MessageBody() payload: EditPayload
  ): Promise<WsResponse<any>> {
    const { postId, content } = payload;
    this.logger.log(`Saving content for post ${postId}`);
    
    try {
      const updatedPost = await this.postService.updatePost(postId, { content });
      this.server.to(`post:${postId}`).emit('content-saved', {
        postId, 
        timestamp: new Date().toISOString() 
      });
      
      return { 
        event: 'save-content-response', 
        data: { success: true, post: updatedPost } 
      };
    } catch (error) {
      this.logger.error(`Error saving content: ${error.message}`);
      
      return { 
        event: 'save-content-response', 
        data: { success: false, error: error.message } 
      };
    }
  }
} 