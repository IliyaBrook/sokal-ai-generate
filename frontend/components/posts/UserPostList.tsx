"use client";

import { useAuthUserFetch } from "@/hooks/useAuthUserFetch";
import { IPost } from "@/types";
import { useEffect, useState } from "react";
import { PostItem } from "./PostItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

export const UserPostList = ({ posts: initialPosts }: { posts: IPost[] }) => {
  const [posts, setPosts] = useState(initialPosts);
  
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const apiFetch = useAuthUserFetch<IPost>()

  const handlePublish = async (postId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }
      const data = await apiFetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: true }),
      })
      return data;
    } catch (error) {
      console.error('Error publishing post:', error);
      throw error;
    }
  }

  const handleEditPost = async (id: string, content: string): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const data = await apiFetch(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      })
    
      if (!data) {
        throw new Error("Failed to update post");
      }
      const updatedPosts = posts.map(post => 
        post.id === id ? { ...post, content } : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  const getScheduledPosts = () => {
    return Array.isArray(posts) 
      ? posts.filter(post => 
        !post.isPublished && post.scheduledPublishDate && new Date(post.scheduledPublishDate) > new Date()
      )
      : [];
  }

  const getPublishedPosts = () => {
    return Array.isArray(posts)
      ? posts.filter(post => post.isPublished)
      : [];
  }

  const getDraftPosts = () => {
    return Array.isArray(posts)
      ? posts.filter(post => 
        !post.isPublished && (!post.scheduledPublishDate || new Date(post.scheduledPublishDate) <= new Date())
      )
      : [];
  }

  const scheduledPosts = getScheduledPosts();
  const publishedPosts = getPublishedPosts();
  const draftPosts = getDraftPosts();

  return (
    <div className="space-y-8">
      <Tabs defaultValue="all_posts" className="w-[400px] mb-4">
        <TabsList>
          <TabsTrigger value="all_posts">All Posts</TabsTrigger>
          <TabsTrigger value="shceduled_posts">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="published_posts">Published Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
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
                    mode="published"
                  />
                ))}
              </div>
            </div>
          )}

          {draftPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Drafts</h2>
              <div className="grid gap-6">
                {draftPosts.map((post) => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    onPublish={handlePublish} 
                    onEdit={handleEditPost}
                    mode="published"
                  />
                ))}
              </div>
            </div>
          )}

          {publishedPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Published Posts</h2>
              <div className="grid gap-6">
                {publishedPosts.map((post) => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    onPublish={handlePublish} 
                    onEdit={handleEditPost}
                    mode="published"
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}