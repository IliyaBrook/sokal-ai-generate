import { IPost } from '@/types'
import { PostItem } from './PostItem'
import { useState } from 'react'

export const PostList = ({ posts }: { posts: IPost[] }) => {
  const handlePublish = async (postId: string) => {
    try {
      const response = await fetch('/api/posts/published', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ postId }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to publish post')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error publishing post:', error)
      throw error
    }
  }


  
  return (
    <div className="grid gap-6">
      {
        posts.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No posts found</p>
          </div>
        ): (
          posts.map((post) => (
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