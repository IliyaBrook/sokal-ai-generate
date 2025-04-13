import { Badge } from "@/components/ui";
import { useMemo } from "react";

interface Editor {
  userId: string;
  clientId: string;
  userName?: string;
}

interface CollaborationStatusProps {
  isConnected: boolean;
  editors: Editor[];
  currentUserId: string;
}

export function CollaborationStatus({ 
  isConnected, 
  editors, 
  currentUserId 
}: CollaborationStatusProps) {
  // Фильтруем, чтобы не показывать текущего пользователя в списке
  const otherEditors = useMemo(() => {
    return editors.filter(editor => editor.userId !== currentUserId);
  }, [editors, currentUserId]);

  return (
    <div className="mb-4 border-b pb-3">
      <div className="flex items-center gap-2">
        <Badge
          variant={isConnected ? "secondary" : "destructive"}
          className={isConnected ? "animate-pulse" : ""}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
        
        {otherEditors.length > 0 && (
          <Badge variant="outline">
            {otherEditors.length} {otherEditors.length === 1 ? 'user' : 'users'} online
          </Badge>
        )}
      </div>
      
      {otherEditors.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Editors online:</p>
          <div className="flex flex-wrap gap-1">
            {otherEditors.map((editor) => (
              <Badge 
                key={editor.clientId}
                variant="outline"
                className="text-xs"
              >
                {editor.userName || `User ${editor.userId.substring(0, 4)}`}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 