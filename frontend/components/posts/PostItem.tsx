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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
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
        post.scheduledPublishDate = updatedPost.scheduledPublishDate;
        setShowScheduler(false);
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
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
        post.scheduledPublishDate = undefined;
      }
    } catch (error) {
      console.error("Error canceling schedule:", error);
    }
  };

  const getPostStatus = () => {
    if (isPublished) return "Published";
    if (post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date()) {
      return `Scheduled for ${format(new Date(post.scheduledPublishDate), "PPP HH:mm")}`;
    }
    return "Draft";
  };
  
  const isScheduled = !isPublished && post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date();
  
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      initialFocus
                      disabled={(date: Date) => {
                        const today = new Date();
                        return date.getDate() < today.getDate() && 
                               date.getMonth() <= today.getMonth() && 
                               date.getFullYear() <= today.getFullYear();
                      }}
                      classNames={{
                        day_selected: "bg-primary text-primary-foreground font-bold",
                      }}
                    />
                  </PopoverContent>
                </Popover>
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
                Scheduled: {post.scheduledPublishDate ? format(new Date(post.scheduledPublishDate), "PPP HH:mm") : ""}
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
