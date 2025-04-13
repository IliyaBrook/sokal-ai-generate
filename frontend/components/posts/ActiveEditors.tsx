import { Badge } from "@/components/ui";
import { useMemo } from "react";

interface Editor {
  userId: string;
  clientId: string;
  userName?: string;
}

interface ActiveEditorsProps {
  editors: Editor[];
  currentUserId: string;
}

export function ActiveEditors({ editors, currentUserId }: ActiveEditorsProps) {
  const otherEditors = useMemo(() => {
    return editors.filter(editor => editor.userId !== currentUserId);
  }, [editors, currentUserId]);

  if (otherEditors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {otherEditors.map((editor) => (
        <Badge 
          key={editor.clientId}
          variant="secondary"
          className="animate-pulse"
        >
          {editor.userName || `User ${editor.userId.substring(0, 4)}`} editing...
        </Badge>
      ))}
    </div>
  );
} 