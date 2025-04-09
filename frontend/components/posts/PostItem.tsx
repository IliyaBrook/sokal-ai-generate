"use client";

import { useState } from "react";
import { IPost } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui";
import { RichTextEditor } from "../RIchTextEditor/RichTextEditor";
import "highlight.js/styles/atom-one-dark.css";

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
  mode,
  ...props
}: PostItemProps) => {
  const [isPublished, setIsPublished] = useState(post.isPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const handlePublish = async () => {
    if (onPublish && typeof onPublish === "function") {
      setIsPublishing(true);
      try {
        const result = await onPublish(post.id);
        console.log("Publish result:", result);
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

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        {mode === "published" && <CardDescription>{isPublished ? "Published" : "Draft"}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <>
            <RichTextEditor
              content={editedContent}
              onUpdate={setEditedContent}
            />
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
          </>
        ) : (
          <RichTextEditor
            content={post.content}
            mode={isEditing ? "published" : "preview"}
        />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          {mode !== "preview" && onEdit && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              disabled={isEditing}
            >
              Edit
            </Button>
          )}
          {!isPublished && mode !== "preview" && (
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
