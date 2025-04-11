"use client";

import { Button } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { cn } from "@/lib";
import { ICreatePostData, IPost } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { PostItem } from "./PostItem";

export const GeneratePost = ({
  onPostGenerated,
}: {
  onPostGenerated: (newPost: IPost) => void;
}) => {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<IPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const apiFetch = useAuthUserFetch<IPost>();

  const handleGenerate: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    if (!topic || !style) return;

    setIsGenerating(true);
    try {
      const post = await apiFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ topic, style }),
      });

      if (!post) {
        throw new Error("Failed to generate post");
      }
      setGeneratedPost({
        ...post,
        id: "preview",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error generating post:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPost) return;

    try {
      const postData: ICreatePostData = {
        title: generatedPost.title,
        content: generatedPost.content,
        topic: generatedPost.topic,
        style: generatedPost.style,
      };

      const savedPost = await apiFetch("/api/posts/save", {
        method: "POST",
        body: JSON.stringify(postData),
      });

      if (!savedPost) {
        throw new Error("Failed to save post");
      }

      onPostGenerated(savedPost);
      setTopic("");
      setStyle("");
      setIsDialogOpen(false);
      setGeneratedPost(null);
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };
  
  return (
    <>
      <div className="mb-8 p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Generate New Post</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter topic"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter writing style"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic || !style}
          >
            {isGenerating ? "Generating..." : "Generate Post"}
          </Button>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Generated Post</AlertDialogTitle>
          </AlertDialogHeader>

          {generatedPost && (
            <div className="my-4 max-h-[60vh] overflow-y-auto">
              <PostItem
                post={generatedPost}
                onPublish={async () => {}}
                mode="preview"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setGeneratedPost(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
