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
import { UserDataContext } from "@/contexts/UserData.context";
import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { usePostEditing } from "@/hooks/usePostEditing";
import { socket } from "@/lib/socket";
import { IPost } from "@/types";
import { format } from "date-fns";
import "highlight.js/styles/atom-one-dark.css";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { RichTextEditor, RichTextEditorRef } from "../RIchTextEditor/RichTextEditor";
import { Button } from "../ui";
import { CollaborationStatus } from "./CollaborationStatus";

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
  onPublish?: ((postId: string) => Promise<any> | undefined);
  onEdit?: (id: string, content: string) => Promise<void>;
  showStatus?: boolean;
  showEdit?: boolean;
  showShare?: boolean;
  showSchedule?: boolean;
  showPublish?: boolean;
  liveView?: boolean;
  editable?: boolean;
}

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const PostItem = ({
  post,
  onPublish,
  onEdit,
  showStatus = false,
  showEdit = false,
  showShare = false,
  showSchedule = false,
  showPublish = false,
  liveView = false,
  editable = false,
}: PostItemProps) => {
  const [isPublished, setIsPublished] = useState(post.isPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleTime, setScheduleTime] = useState(getCurrentTime());
  const [shortLink, setShortLink] = useState<string | undefined>(post.shortLink);
  const [shortLinkId, setShortLinkId] = useState<string | undefined>(undefined);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isDeletingLink, setIsDeletingLink] = useState(false);
  
  const editorRef = useRef<RichTextEditorRef>(null);
  const lastUpdateRequestRef = useRef<Promise<any> | null>(null);
  
  const apiFetch = useAuthUserFetch();
  const contextData = useContext(UserDataContext);
  const user = contextData?.userData;

  const initialContentRef = useRef(post.content);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const { 
    content: liveContent, 
    updateContent: setLiveContent,
    saveContent,
    isConnected,
    activeWatchers,
    connect,
    disconnect,
  } = usePostEditing({
    postId: post.id,
    initialContent: post.content,
    autoConnect: liveView,
  });

  useEffect(() => {
    if (liveContent) {
      console.log('📝 Content in PostItem:', 
        post.id.substring(post.id.length - 6),
        liveContent.substring(0, 30) + '...'
      );
    }
  }, [liveContent, post.id]);

  const isLocalUpdate = useRef(false);
  
  useEffect(() => {
    if (liveView && liveContent && !isLocalUpdate.current && editorRef.current) {
      console.log("Updating editor content from socket:", liveContent?.substring(0, 30) + "...");
      editorRef.current.updateContent(liveContent);
      setEditedContent(liveContent);
    }
    isLocalUpdate.current = false;
  }, [liveContent, liveView]);

  useEffect(() => {
    if (liveView) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [liveView, connect, disconnect]);

  useEffect(() => {
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current);
      contentUpdateTimeoutRef.current = null;
    }

    if (liveView && liveContent && onEdit && !isLocalUpdate.current && liveContent !== initialContentRef.current) {
      contentUpdateTimeoutRef.current = setTimeout(async () => {
        try {
          if (lastUpdateRequestRef.current) {
            await lastUpdateRequestRef.current;
          }
          
          const updateRequest = onEdit(post.id, liveContent);
          lastUpdateRequestRef.current = updateRequest;
          
          await updateRequest;
          console.log("📝 Database updated with socket content");
          initialContentRef.current = liveContent;
          lastUpdateRequestRef.current = null;
        } catch (error) {
          console.error("❌ Error updating database:", error);
          lastUpdateRequestRef.current = null;
        }
      }, 2000);
    }
    
    return () => {
      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current);
      }
    };
  }, [liveContent, liveView, onEdit, post.id]);

  const handleContentUpdate = (newContent: string) => {
    isLocalUpdate.current = true;
    console.log("Local content update:", newContent?.substring(0, 30) + "...");
    setEditedContent(newContent);
    
    if (liveView) {
      console.log("Sending to socket:", newContent?.substring(0, 30) + "...");
      setLiveContent(newContent);
    }
  };

  const displayContent = liveView && liveContent ? liveContent : editedContent;

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
    try {
      // Проверяем, изменился ли контент
      const contentToSave = liveView ? liveContent : editedContent;
      const initialContent = initialContentRef.current;
      
      if (contentToSave === initialContent) {
        console.log("Content hasn't changed, skipping save");
        setIsEditing(false);
        return;
      }
      
      if (liveView) {
        console.log("Saving through socket...");
        const success = await saveContent();
        if (success) {
          toast.success("Post updated");
          if (onEdit) {
            if (lastUpdateRequestRef.current) {
              await lastUpdateRequestRef.current;
            }
            
            const updateRequest = onEdit(post.id, liveContent || editedContent);
            lastUpdateRequestRef.current = updateRequest;
            
            await updateRequest;
            
            initialContentRef.current = liveContent || editedContent;
            lastUpdateRequestRef.current = null;
          }
        } else {
          toast.error("Failed to save post");
        }
      } else if (onEdit) {
        console.log("Saving through API...");
        
        if (lastUpdateRequestRef.current) {
          await lastUpdateRequestRef.current;
        }
        
        const updateRequest = onEdit(post.id, editedContent);
        lastUpdateRequestRef.current = updateRequest;
        
        await updateRequest;
        
        initialContentRef.current = editedContent;
        lastUpdateRequestRef.current = null;
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
      lastUpdateRequestRef.current = null;
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
        post.scheduledPublishDate = updatedPost.scheduledPublishDate;
        
        if (onEdit) {
          await onEdit(post.id, updatedPost.content);
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
        post.scheduledPublishDate = updatedPost.scheduledPublishDate;
        
        if (onEdit) {
          await onEdit(post.id, updatedPost.content);
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
    if (post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date()) {
      return `Scheduled for ${format(new Date(post.scheduledPublishDate), "PPP HH:mm")}`;
    }
    return "Draft";
  };
  
  const isScheduled = !isPublished && post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date();
  
  const isAuthorized = !!user?.id && !user?.id.startsWith('anonymous-');
  
  const isSharedPage = pathname.includes('/shared/');
  
  const displayEditButton = showEdit && onEdit && isAuthorized && !isEditing && !liveView && !isSharedPage;
  
 
  const isEditable = editable || (liveView && isAuthorized) || isEditing;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        {showStatus && (
          <CardDescription>
            {getPostStatus()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {liveView && (
          <CollaborationStatus
            isConnected={isConnected}
            editors={activeWatchers}
            currentUserId={user?.id || `anonymous-${socket.id}`}
          />
        )}
        
        <RichTextEditor
          ref={editorRef}
          content={displayContent}
          onUpdate={handleContentUpdate}
          mode={isEditable ? "published" : "preview"}
          editable={isEditable}
        />
        
        {(isEditing || (isEditable && liveView && !isSharedPage)) && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              variant="secondary"
            >
              Save
            </Button>
            {isEditing && (
              <Button
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
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
            {showShare && !isSharedPage && (
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
            
            {!isPublished && showSchedule && !isScheduled && isAuthorized && !isSharedPage && (
              <Button 
                variant="outline" 
                onClick={() => setShowScheduler(!showScheduler)}
              >
                Schedule
              </Button>
            )}
            
            {displayEditButton && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
              >
                Edit
              </Button>
            )}
            
            {!isPublished && showPublish && !isScheduled && isAuthorized && !isSharedPage && (
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
