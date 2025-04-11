"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DatePickerInput
} from "@/components/ui";
import { useAuthUserFetch } from "@/hooks";
import { IPost } from "@/types";
import { format } from "date-fns";
import "highlight.js/styles/atom-one-dark.css";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { RichTextEditor } from "../RIchTextEditor/RichTextEditor";
import { Button } from "../ui";

interface ShortLinkResponse {
  id: string
  code: string
  targetType: string
  targetId: string
  url: string
  createdAt: Date
  expiresAt?: Date
}

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
  const [shortLink, setShortLink] = useState<string | undefined>(post.shortLink);
  const [shortLinkId, setShortLinkId] = useState<string | undefined>(undefined);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isDeletingLink, setIsDeletingLink] = useState(false);

  const apiFetch = useAuthUserFetch();

  const [localScheduledDate, setLocalScheduledDate] = useState<Date | undefined | null>(
    post.scheduledPublishDate ? new Date(post.scheduledPublishDate) : undefined
  );

  const handlePublish = async () => {
    if (onPublish && typeof onPublish === "function") {
      setIsPublishing(true);
      try {
        await onPublish(post.id);
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

  const handleCreateShortLink = async () => {
    setIsCreatingLink(true);
    try {
      const response = await apiFetch<ShortLinkResponse>(`/api/short`, {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'post',
          targetId: post.id
        }),
      });
      
      if (response && response.url) {
        const url = response.url;
        const code = url.split('/').pop();
        const formattedUrl = `${window.location.origin}/shared/${code}`;
        
        setShortLink(formattedUrl);
        setShortLinkId(response.id);
        setShowLinkDialog(true);
        toast.success("Share link created successfully");
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      toast.error("Failed to create share link. Please try again.");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleDeleteShortLink = async () => {
    if (!shortLinkId) {
      toast.error("Cannot delete link: missing link ID");
      return;
    }
    
    setIsDeletingLink(true);
    try {
      const response = await apiFetch<ShortLinkResponse>(`/api/short/${shortLinkId}`, {
        method: 'DELETE',
      });
      
      if (response) {
        setShortLink(undefined);
        setShortLinkId(undefined);
        toast.success("Share link deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting share link:", error);
      toast.error("Failed to delete share link. Please try again.");
    } finally {
      setIsDeletingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
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
      const updatedPost = await apiFetch<IPost>(`/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          scheduledPublishDate: scheduledDateTime
        }),
      });
      
      if (updatedPost) {
        setLocalScheduledDate(scheduledDateTime);
        post.scheduledPublishDate = updatedPost.scheduledPublishDate;
        
        if (onEdit) {
          await onEdit(post.id, post.content);
        }
        
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
      const updatedPost = await apiFetch<IPost>(`/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          scheduledPublishDate: null
        }),
      });
      
      if (updatedPost) {
        setLocalScheduledDate(null);
        post.scheduledPublishDate = undefined;
        
        if (onEdit) {
          await onEdit(post.id, post.content);
        }
        
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
            <Button
              onClick={handleSave}
              variant="secondary"
            >
              Save
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        
        {showScheduler && (
          <div className="mt-4 border p-4 rounded">
            <h3 className="text-lg font-medium mb-2">Schedule Publication</h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm mb-1">Date</label>
                <DatePickerInput
                  selected={scheduleDate}
                  onChange={(date: Date | null) => date && setScheduleDate(date)}
                />
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
            {/* Кнопки управления ссылками - доступны всегда, когда mode="published" */}
            {mode === "published" && (
              <>
                {shortLink ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowLinkDialog(true)}
                    >
                      Show Link
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteShortLink}
                      disabled={isDeletingLink}
                    >
                      {isDeletingLink ? "Deleting..." : "Delete Link"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleCreateShortLink}
                    disabled={isCreatingLink}
                  >
                    {isCreatingLink ? "Creating..." : "Share"}
                  </Button>
                )}
              </>
            )}
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
      
      <AlertDialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Post</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Share this link with others:</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={shortLink} 
                readOnly 
                className="flex-1 p-2 border rounded"
              />
              <Button onClick={() => copyToClipboard(shortLink || '')}>
                Copy
              </Button>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Close
              </Button>
              <Button 
                variant="default" 
                onClick={handleCreateShortLink}
                disabled={isCreatingLink}
              >
                {isCreatingLink ? "Creating..." : "Generate New Link"}
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
