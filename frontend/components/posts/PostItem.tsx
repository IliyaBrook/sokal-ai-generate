"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DatePickerInput,
} from "@/components/ui";
import { UserDataContext } from "@/contexts/UserData.context";
import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { usePostEditing } from "@/hooks/usePostEditing";
import { socket } from "@/lib/socket";
import { IPost } from "@/types";
import "highlight.js/styles/atom-one-dark.css";
import { usePathname } from "next/navigation";
import React, { useContext, useEffect, useRef, useState, createContext } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import {
  RichTextEditor,
  RichTextEditorRef,
} from "../RIchTextEditor/RichTextEditor";
import { Button } from "../ui";
import { CollaborationStatus } from "./CollaborationStatus";
import { PostStatusBadge } from "./PostStatusBadge";
import { useRouter } from "next/navigation";

interface EditingContextType {
  activeEditPostId: string | null;
  setActiveEditPostId: (id: string | null) => void;
}

export const EditingContext = createContext<EditingContextType>({
  activeEditPostId: null,
  setActiveEditPostId: () => {},
});

interface ShortLinkResponse {
  id: string;
  code: string;
  targetType: string;
  targetId: string;
  url: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PostItemProps extends React.HTMLAttributes<HTMLDivElement> {
  post: IPost;
  onPublish?: (postId: string) => Promise<any> | undefined;
  onEdit?: (id: string, content: string) => Promise<IPost>;
  showShare?: boolean;
  showSchedule?: boolean;
  liveView?: boolean;
  editable?: boolean;
  showEdit?: boolean;
}

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const PostItem = ({
  post,
  onPublish,
  onEdit,
  showShare = false,
  showSchedule = false,
  liveView = false,
  editable = false,
  showEdit = true,
}: PostItemProps) => {
  const [isPublished, setIsPublished] = useState(post.isPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCancelingSchedule, setIsCancelingSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState(getCurrentTime());
  const [shortLink, setShortLink] = useState<string | undefined>(
    post.shortLink
  );
  const [shortLinkId, setShortLinkId] = useState<string | undefined>(undefined);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isDeletingLink, setIsDeletingLink] = useState(false);
  const router = useRouter();

  const editorRef = useRef<RichTextEditorRef>(null);
  const lastUpdateRequestRef = useRef<Promise<any> | null>(null);

  const apiFetch = useAuthUserFetch();
  const contextData = useContext(UserDataContext);
  const user = contextData?.userData;

  const editingContext = useContext(EditingContext);

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
    if (
      editingContext.activeEditPostId &&
      editingContext.activeEditPostId !== post.id &&
      isEditing
    ) {
      setIsEditing(false);
    }
  }, [editingContext.activeEditPostId, post.id, isEditing]);

  useEffect(() => {
    if (isEditing) {
      editingContext.setActiveEditPostId(post.id);
    }
  }, [isEditing, post.id, editingContext]);

  const isLocalUpdate = useRef(false);

  useEffect(() => {
    if (
      liveView &&
      liveContent &&
      !isLocalUpdate.current &&
      editorRef.current
    ) {
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

    if (
      liveView &&
      liveContent &&
      onEdit &&
      !isLocalUpdate.current &&
      liveContent !== initialContentRef.current
    ) {
      const isUpdating = lastUpdateRequestRef.current !== null;

      if (isUpdating) {
        return;
      }

      contentUpdateTimeoutRef.current = setTimeout(async () => {
        try {
          const updateRequest = onEdit(post.id, liveContent);
          lastUpdateRequestRef.current = updateRequest;

          await updateRequest;
          initialContentRef.current = liveContent;
          lastUpdateRequestRef.current = null;
        } catch{
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
    setEditedContent(newContent);

    if (liveView) {
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
        toast.success("Post published successfully", {
          id: `publish-${Date.now()}`,
        });
      } catch {
        toast.error("Failed to publish post", {
          id: `publish-error-${Date.now()}`,
        });
      } finally {
        setIsPublishing(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      const contentToSave = liveView ? liveContent : editedContent;
      const initialContent = initialContentRef.current;

      if (contentToSave === initialContent) {
        setIsEditing(false);
        return;
      }

      if (lastUpdateRequestRef.current) {
        await lastUpdateRequestRef.current;
      }

      if (liveView) {
        const success = await saveContent();
        if (success) {
          toast.success("Post updated", { id: `save-${Date.now()}` });
          if (onEdit) {
            const updateRequest = onEdit(post.id, liveContent || editedContent);
            lastUpdateRequestRef.current = updateRequest;

            await updateRequest;

            initialContentRef.current = liveContent || editedContent;
            lastUpdateRequestRef.current = null;
          }
        } else {
          toast.error("Failed to save post", {
            id: `save-error-${Date.now()}`,
          });
        }
      } else if (onEdit) {
        const updateRequest = onEdit(post.id, editedContent);
        lastUpdateRequestRef.current = updateRequest;

        await updateRequest;

        initialContentRef.current = editedContent;
        lastUpdateRequestRef.current = null;
      }

      setIsEditing(false);
      if (editingContext.activeEditPostId === post.id) {
        editingContext.setActiveEditPostId(null);
      }
    } catch {
      toast.error("Failed to save post", { id: `save-error-${Date.now()}` });
      lastUpdateRequestRef.current = null;
    }
  };

  const handleCreateShortLink = async () => {
    setIsCreatingLink(true);
    try {
      const response = await apiFetch<ShortLinkResponse>(`/api/short`, {
        method: "POST",
        body: JSON.stringify({
          targetType: "post",
          targetId: post.id,
        }),
      });

      if (response && response.url) {
        const url = response.url;
        const code = url.split("/").pop();
        const formattedUrl = `${window.location.origin}/shared/${code}`;

        setShortLink(formattedUrl);
        setShortLinkId(response.id);
        setShowLinkDialog(true);
        toast.success("Share link created successfully", {
          id: `link-create-${Date.now()}`,
        });
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      toast.error("Failed to create share link. Please try again.", {
        id: `link-create-error-${Date.now()}`,
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleDeleteShortLink = async () => {
    if (!shortLinkId) {
      toast.error("Cannot delete link: missing link ID", {
        id: `link-delete-error-${Date.now()}`,
      });
      return;
    }

    setIsDeletingLink(true);
    try {
      const response = await apiFetch<ShortLinkResponse>(
        `/api/short/${shortLinkId}`,
        {
          method: "DELETE",
        }
      );

      if (response) {
        setShortLink(undefined);
        setShortLinkId(undefined);
        toast.success("Share link deleted successfully", {
          id: `link-delete-${Date.now()}`,
        });
      }
    } catch (error) {
      console.error("Error deleting share link:", error);
      toast.error("Failed to delete share link. Please try again.", {
        id: `link-delete-error-${Date.now()}`,
      });
    } finally {
      setIsDeletingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard", { id: `copy-${Date.now()}` });
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;

    const scheduledDateTime = new Date(scheduleDate);
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    scheduledDateTime.setHours(hours, minutes);

    const now = new Date();
    if (scheduledDateTime < now) {
      toast.error(
        "Cannot schedule for a past time. Please select a future time.",
        { id: `schedule-error-${Date.now()}` }
      );
      return;
    }

    setIsScheduling(true);
    try {
      const updatedPost = await apiFetch<IPost>(`/api/posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({
          scheduledPublishDate: scheduledDateTime,
        }),
      });

      if (updatedPost) {
        post.scheduledPublishDate = updatedPost.scheduledPublishDate;

        if (onEdit) {
          await onEdit(post.id, updatedPost.content);
        }

        setShowScheduler(false);
        toast.success("Post scheduled successfully", {
          id: `schedule-${Date.now()}`,
        });
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post. Please try again.", {
        id: `schedule-error-${Date.now()}`,
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (isCancelingSchedule) return;

    setIsCancelingSchedule(true);
    try {
      const updatedPost = await apiFetch<IPost>(`/api/posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({
          scheduledPublishDate: null,
        }),
      });

      if (updatedPost) {
        post.scheduledPublishDate = updatedPost.scheduledPublishDate;

        if (onEdit) {
          await onEdit(post.id, updatedPost.content);
        }

        toast.success("Publication schedule has been canceled", {
          id: `cancel-schedule-${Date.now()}`,
        });
      }
    } catch (error) {
      console.error("Error canceling schedule:", error);
      toast.error("Failed to cancel schedule. Please try again.", {
        id: `cancel-schedule-error-${Date.now()}`,
      });
    } finally {
      setIsCancelingSchedule(false);
    }
  };

  const hasScheduledDate =
    !isPublished &&
    post.scheduledPublishDate &&
    new Date(post.scheduledPublishDate) > new Date();

  const isAuthorized = !!user?.id && !user?.id.startsWith("anonymous-");

  const isSharedPage = pathname.includes("/shared/");

  const isEditable = editable || (liveView && isAuthorized) || isEditing;

  const toggleEditing = () => {
    if (isEditing) {
      setIsEditing(false);
      editingContext.setActiveEditPostId(null);
    } else {
      setIsEditing(true);
      editingContext.setActiveEditPostId(post.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
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
          editable={isEditable}
        />

        {(isEditing || (isEditable && liveView && !isSharedPage)) && (
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} variant="secondary">
              Save
            </Button>
            {isEditing && (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  editingContext.setActiveEditPostId(null);
                }}
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
                  onChangeAction={(date: Date | null) =>
                    date && setScheduleDate(date)
                  }
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

          {hasScheduledDate && (
            <PostStatusBadge
              status="scheduled"
              scheduledDate={post.scheduledPublishDate}
              showCancelButton={!isCancelingSchedule}
              onCancelSchedule={handleCancelSchedule}
            />
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

            {showSchedule && isAuthorized && !isPublished && (
              <Button
                variant="outline"
                onClick={() => setShowScheduler(!showScheduler)}
              >
                Schedule
              </Button>
            )}

            {!isSharedPage && showEdit && (
              <Button onClick={toggleEditing} variant="secondary">
                {isEditing ? "Cancel Edit" : "Edit"}
              </Button>
            )}

            {!isPublished && onPublish && (
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
            <p className="text-sm text-gray-500 mb-2">
              Share this link with others:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shortLink}
                readOnly
                className="flex-1 p-2 border rounded"
              />
              <Button onClick={() => copyToClipboard(shortLink || "")}>
                Copy
              </Button>
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => router.push(shortLink || "")}>
                  Go to
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
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
