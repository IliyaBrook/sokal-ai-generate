"use client";

import { useState } from "react";
import { IPost } from "@/types";
import { Button } from "../ui";
import { RichTextEditor } from "../RIchTextEditor/RichTextEditor";
import "highlight.js/styles/atom-one-dark.css";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib";
import { useAuthUserFetch } from "@/hooks";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface PostItemProps extends React.HTMLAttributes<HTMLDivElement> {
  post: IPost;
  onPublish?: (postId: string) => Promise<any>;
  onEdit?: (id: string, content: string) => Promise<void>;
  mode?: "preview" | "published";
}

export const PostItem = ({
  post,
  onPublish,
  onEdit,
  mode
}: PostItemProps) => {
  const [isPublished, setIsPublished] = useState(post.isPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const apiFetch = useAuthUserFetch<IPost>();
  const [localScheduledDate, setLocalScheduledDate] = useState<Date | undefined | null>(
    post.scheduledPublishDate ? new Date(post.scheduledPublishDate) : undefined
  );

  const handlePublish = async () => {
    if (onPublish && typeof onPublish === "function") {
      setIsPublishing(true);
      try {
        const result = await onPublish(post.id);
        setIsPublished(true);
      } catch (error) {
        console.error("Error publishing post:", error);
      } finally {
        setIsPublishing(false);
      }
    }
  };

  const handleSave = async () => {
    if (onEdit) {
      await onEdit(post.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;
    
    const scheduledDateTime = new Date(scheduleDate);
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    scheduledDateTime.setHours(hours, minutes);
    
    const now = new Date();
    if (scheduledDateTime < now) {
      toast.error("Cannot schedule for a past time. Please select a future time.");
      return;
    }
    
    setIsScheduling(true);
    try {
      const updatedPost = await apiFetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          scheduledPublishDate: scheduledDateTime
        }),
      });
      
      if (updatedPost) {
        setLocalScheduledDate(scheduledDateTime);
        post.scheduledPublishDate = updatedPost.scheduledPublishDate;
        setShowScheduler(false);
        toast.success("Post scheduled successfully");
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelSchedule = async () => {
    try {
      const updatedPost = await apiFetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          scheduledPublishDate: null
        }),
      });
      
      if (updatedPost) {
        setLocalScheduledDate(null);
        post.scheduledPublishDate = undefined;
        toast.success("Publication schedule has been canceled");
      }
    } catch (error) {
      console.error("Error canceling schedule:", error);
      toast.error("Failed to cancel schedule. Please try again.");
    }
  };

  const getPostStatus = () => {
    if (isPublished) return "Published";
    if (localScheduledDate && new Date(localScheduledDate) > new Date()) {
      return `Scheduled for ${format(new Date(localScheduledDate), "PPP HH:mm")}`;
    }
    return "Draft";
  };
  
  const isScheduled = !isPublished && localScheduledDate && new Date(localScheduledDate) > new Date();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        {mode === "published" && (
          <CardDescription>
            {getPostStatus()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <RichTextEditor
          key={isEditing ? `richTextEditor-published-${post.id}` : `richTextEditor-preview-${post.id}`}
          content={editedContent}
          onUpdate={setEditedContent}
          mode={isEditing ? "published" : "preview"}
        />
        {isEditing && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        )}
        
        {showScheduler && (
          <div className="mt-4 border p-4 rounded">
            <h3 className="text-lg font-medium mb-2">Schedule Publication</h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm mb-1">Date</label>
                <div className="relative">
                  <DatePicker
                    selected={scheduleDate}
                    onChange={(date: Date | null) => date && setScheduleDate(date)}
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                    placeholderText="Select a date"
                    className="w-full border rounded p-2 pl-10"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    todayButton="Today"
                    highlightDates={[new Date()]}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSchedule} 
                  disabled={!scheduleDate || isScheduling}
                >
                  {isScheduling ? "Scheduling..." : "Schedule"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowScheduler(false)}
                >
                  Cancel
                </Button>
              </div>             
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          
          {isScheduled && (
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Scheduled: {localScheduledDate ? format(new Date(localScheduledDate), "PPP HH:mm") : ""}
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancelSchedule}
              >
                Cancel Schedule
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            {!isPublished && mode !== "preview" && !isScheduled && (
              <Button 
                variant="outline" 
                onClick={() => setShowScheduler(!showScheduler)}
              >
                Schedule
              </Button>
            )}
            {mode !== "preview" && onEdit && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                disabled={isEditing}
              >
                Edit
              </Button>
            )}
            {!isPublished && mode !== "preview" && !isScheduled && (
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
