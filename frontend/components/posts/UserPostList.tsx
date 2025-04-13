"use client";

import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { IPost } from "@/types";
import { useEffect, useState } from "react";
import { PostItem } from "./PostItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface UserPostListProps {
  posts: IPost[];
  isLoading?: boolean;
  onPublish?: (postId: string) => Promise<any>;
  onEdit?: (id: string, content: string) => Promise<void>;
}

export const UserPostList = ({ posts = [], isLoading = false, onPublish, onEdit }: UserPostListProps) => {
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);

  const handlePublish = async (postId: string) => {
    setPublishingPostId(postId);
    
    try {
      if (onPublish) {
        await onPublish(postId);
      }
    } finally {
      setPublishingPostId(null);
    }
  };

  if (isLoading) {
    return <div className="grid gap-4 mt-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-2/3 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-gray-200 rounded"></div>
          </CardContent>
          <CardFooter>
            <div className="h-10 w-1/4 bg-gray-200 rounded"></div>
          </CardFooter>
        </Card>
      ))}
    </div>;
  }

  if (posts.length === 0) {
    return <div className="text-center my-8">
      <p className="text-gray-500">You haven't created any posts yet.</p>
    </div>;
  }

  return (
    <div className="grid gap-6 mt-4">
      {posts.map((post: IPost) => (
        <PostItem 
          key={post.id}
          post={post}
          onPublish={handlePublish}
          onEdit={onEdit}
          showStatus
          showEdit
          showShare
          showSchedule
          showPublish
          liveView={true}
          editable={true}
        />
      ))}
    </div>
  );
};