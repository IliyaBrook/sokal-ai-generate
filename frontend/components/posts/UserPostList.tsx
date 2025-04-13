"use client";

import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { IPost } from "@sokal_ai_generate/shared-types";
import { useEffect, useState } from "react";
import { PostItem } from "./PostItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { toast } from "sonner";

const defaultPostItemProps = {
  showStatus: true,
  showEdit: true,
  showSchedule: true,
  showShare: true,
  liveView: false,
  editable: false
}


export const UserPostList = ({ posts: initialPosts }: { posts: IPost[] }) => {
  const [posts, setPosts] = useState(initialPosts);
  
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const apiFetch = useAuthUserFetch();

  const handlePublish = async (postId: string) => {
    try {
      const data = await apiFetch<IPost>(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: true }),
      });
      
      if (data) {
        const updatedPosts = posts.map(post => 
          post.id === postId ? data : post
        );
        setPosts(updatedPosts);
        toast.success("Post published successfully");
      }
      
      return data;
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error("Failed to publish post");
      throw error;
    }
  };

  const handleEditPost = async (id: string, content: string): Promise<void> => {
    try {
      const data = await apiFetch<IPost>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      
      if (!data) {
        toast.error("Failed to update post");
        throw new Error("Failed to update post");
      }
      
      const updatedPosts = posts.map(post => 
        post.id === id ? data : post
      );
      setPosts(updatedPosts);
      toast.success("Post updated successfully");
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const getScheduledPosts = () => {
    return Array.isArray(posts) 
      ? posts.filter(post => 
        !post.isPublished && post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date()
      )
      : [];
  };

  const getPublishedPosts = () => {
    return Array.isArray(posts)
      ? posts.filter(post => post.isPublished)
      : [];
  };

  const getDraftPosts = () => {
    return Array.isArray(posts)
      ? posts.filter(post => 
        !post.isPublished && (!post.scheduledPublishDate || new Date(post.scheduledPublishDate) <= new Date())
      )
      : [];
  };

  const scheduledPosts = getScheduledPosts();
  const publishedPosts = getPublishedPosts();
  const draftPosts = getDraftPosts();

  return (
    <div className="space-y-8">
      <Tabs defaultValue="all_posts" className="mb-4">
        <TabsList>
          <TabsTrigger value="all_posts">All Posts</TabsTrigger>
          <TabsTrigger value="scheduled_posts">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="published_posts">Published Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="all_posts">
          {!Array.isArray(posts) || posts.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No posts found</p>
            </div>
          ) : (
            <>
              {scheduledPosts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
                  <div className="grid gap-6">
                    {scheduledPosts.map((post) => (
                      <PostItem 
                        key={post.id} 
                        post={post} 
                        onPublish={handlePublish} 
                        onEdit={handleEditPost}
                        {...defaultPostItemProps}
                      />
                    ))}
                  </div>
                </div>
              )}

              {draftPosts.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-4">Drafts</h2>
                  <div className="grid gap-6">
                    {draftPosts.map((post) => (
                      <PostItem 
                        key={post.id} 
                        post={post} 
                        onPublish={handlePublish} 
                        onEdit={handleEditPost}
                        {...defaultPostItemProps}
                      />
                    ))}
                  </div>
                </div>
              )}

              {publishedPosts.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-4">Published Posts</h2>
                  <div className="grid gap-6">
                    {publishedPosts.map((post) => (
                      <PostItem 
                        key={post.id} 
                        post={post} 
                        onPublish={handlePublish} 
                        onEdit={handleEditPost}
                        {...defaultPostItemProps}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="scheduled_posts">
          {scheduledPosts.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No scheduled posts found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {scheduledPosts.map((post) => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onPublish={handlePublish} 
                  onEdit={handleEditPost}
                  {...defaultPostItemProps}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="drafts">
          {draftPosts.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No draft posts found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {draftPosts.map((post) => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onPublish={handlePublish} 
                  onEdit={handleEditPost}
                  {...defaultPostItemProps}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="published_posts">
          {publishedPosts.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No published posts found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {publishedPosts.map((post) => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onPublish={handlePublish} 
                  onEdit={handleEditPost}
                  {...defaultPostItemProps}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};