"use client";

import { useState, useEffect } from "react";
import { IAuthResponse, IPost, IUpdatePostData } from "@/types";
import { PostItem } from "./PostItem";
import useApiFetch from "@/hooks/useApiFetch";

export const UserPostList = ({ posts: initialPosts }: { posts: IPost[] }) => {
  const [posts, setPosts] = useState(initialPosts);
  
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const apiFetch = useApiFetch<IPost>()

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

  const handleEditPost = async (id: string, content: string) => {
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
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  return (
    <div className="grid gap-6">
      {
       !Array.isArray(posts) || posts?.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No posts found</p>
          </div>
        ): (
          posts?.map((post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              onPublish={handlePublish} 
              onEdit={async (id: string, content: string) => {
                await handleEditPost(id, content);
              }}
              mode="published"
            />
          ))
        )
      }
    </div>
  )
}