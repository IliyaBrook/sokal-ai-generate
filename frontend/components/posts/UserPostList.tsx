"use client";

import { useState } from "react";
import { IPost } from "@/types";
import { PostItem } from "./PostItem";

export const UserPostList = ({ posts: initialPosts }: { posts: IPost[] }) => {
  const [posts, setPosts] = useState(initialPosts);

  const handlePublish = async (postId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: true }),
      })
    
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to publish post: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Publication successful:', result);
      return result;
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

      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      })
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update post: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const updatedPosts = posts.map(post => 
        post.id === id ? { ...post, content } : post
      );
      setPosts(updatedPosts);
      return result;
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
              onEdit={handleEditPost}
              mode="published"
            />
          ))
        )
      }
    </div>
  )
}