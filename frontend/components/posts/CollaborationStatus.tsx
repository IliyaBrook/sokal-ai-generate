import React from 'react';
import { Badge } from '@/components/ui';

interface Watcher {
  userId: string;
  clientId: string;
  username?: string;
}

interface CollaborationStatusProps {
  isConnected: boolean;
  editors: Watcher[];
  currentUserId: string;
}

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
  isConnected,
  editors: watchers,
  currentUserId,
}) => {
  // Фильтруем список наблюдателей, исключая текущего пользователя
  const otherWatchers = watchers.filter(watcher => watcher.userId !== currentUserId);
  // Находим текущего пользователя в списке
  const currentUser = watchers.find(watcher => watcher.userId === currentUserId);
  // Разделяем пользователей на авторизованных и анонимных
  const authenticatedWatchers = otherWatchers.filter(watcher => !watcher.userId.startsWith('anonymous-'));
  const anonymousWatchers = otherWatchers.filter(watcher => watcher.userId.startsWith('anonymous-'));
  
  return (
    <div className="mb-4 border rounded-md p-3 bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <Badge 
            variant={isConnected ? "secondary" : "destructive"}
            className="animate-pulse"
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span>{watchers.length} online</span>
        </Badge>
      </div>
      
      <div className="text-sm font-medium mb-2">
        {isConnected 
          ? 'Collaborative viewing active' 
          : 'Connection lost. Trying to reconnect...'}
      </div>
      
      {/* Текущий пользователь */}
      {currentUser && (
        <div className="mt-2 mb-2">
          <div className="text-xs text-muted-foreground mb-1">
            You are connected as:
          </div>
          <Badge variant="default" className="text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {currentUser.username || (currentUser.userId.startsWith('anonymous-') 
              ? `Guest ${currentUser.clientId.substring(0, 4)}` 
              : currentUser.userId.substring(0, 8))}
          </Badge>
        </div>
      )}
      
      {otherWatchers.length > 0 && (
        <div className="mt-3 space-y-2">
          {authenticatedWatchers.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Authorized users ({authenticatedWatchers.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {authenticatedWatchers.map((watcher) => (
                  <Badge key={watcher.clientId} variant="secondary" className="text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {watcher.username || watcher.userId.substring(0, 8)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {anonymousWatchers.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span>Anonymous viewers ({anonymousWatchers.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {anonymousWatchers.map((watcher) => (
                  <Badge key={watcher.clientId} variant="outline" className="text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Guest {watcher.clientId.substring(0, 4)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 