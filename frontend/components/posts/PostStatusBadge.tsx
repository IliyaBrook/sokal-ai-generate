import { format } from "date-fns";
import { Button } from "../ui";

export type PostStatus = "published" | "scheduled" | "draft";

type ColorScheme = {
  bgColor: string;
  textColor: string;
};

const colorSchemes: Record<PostStatus, ColorScheme> = {
  published: {
    bgColor: "bg-green-100",
    textColor: "text-green-800"
  },
  scheduled: {
    bgColor: "bg-blue-100",
    textColor: "text-blue-800"
  },
  draft: {
    bgColor: "bg-gray-100",
    textColor: "text-gray-800"
  }
};

interface PostStatusBadgeProps {
  status: PostStatus;
  scheduledDate?: Date | string | null;
  customColors?: ColorScheme;
  showCancelButton?: boolean;
  onCancelSchedule?: () => Promise<void>;
}

export const PostStatusBadge = ({
  status,
  scheduledDate,
  customColors,
  showCancelButton = false,
  onCancelSchedule
}: PostStatusBadgeProps) => {
  const colors = customColors || colorSchemes[status];
  
  const getStatusText = () => {
    switch (status) {
      case "published":
        return "Published";
      case "scheduled":
        if (scheduledDate) {
          const date = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;
          return `Scheduled for ${format(date, "PPP HH:mm")}`;
        }
        return "Scheduled";
      case "draft":
        return "Draft";
      default:
        return "";
    }
  };

  const renderBadge = () => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bgColor} ${colors.textColor}`}>
      {getStatusText()}
    </span>
  );

  if (showCancelButton && status === "scheduled" && onCancelSchedule) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {getStatusText()}
        </span>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onCancelSchedule}
        >
          Cancel Schedule
        </Button>
      </div>
    );
  }

  return renderBadge();
}; 