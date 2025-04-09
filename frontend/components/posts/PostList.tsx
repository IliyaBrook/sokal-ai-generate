import { IPost } from '@/types'
import { PostItem } from './PostItem'
import { useState } from 'react'

export const PostList = ({ posts }: { posts: IPost[] }) => {
  const handlePublish = async (postId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token:', token ? 'Token exists' : 'No token found');
      
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
      
      console.log('Response status:', response.status);
      
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


  return (
    <div className="grid gap-6">
      {
       !Array.isArray(posts) || posts?.length !== 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No posts found</p>
          </div>
        ): (
          posts?.map((post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              onPublish={handlePublish} 
            />
          ))
        )
      }
    </div>
  )
}