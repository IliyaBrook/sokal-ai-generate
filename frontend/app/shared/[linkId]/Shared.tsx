'use client'

import { PostItem, EditingContext } from "@/components/posts"
import { UserDataContext } from "@/contexts/UserData.context"
import { useAuthUserFetch } from "@/hooks"
import { IPost } from "@/types"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"

interface PostWithAuthor extends IPost {
  authorName?: string
}

export default function Shared({ linkId }: {linkId: string}) {
  const contextData = useContext(UserDataContext)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPost, setCurrentPost] = useState<PostWithAuthor | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeEditPostId, setActiveEditPostId] = useState<string | null>(null)
  const apiFetch = useAuthUserFetch()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/shared/${linkId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (!response.ok) {
          toast.error("Failed to load post. It may have been deleted or the link has expired.")
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!data.post) {
          throw new Error("Post not found")
        }
        
        setCurrentPost({
          ...data.post,
          authorName: `${data.creator.firstname || ''} ${data.creator.lastname || ''}`.trim()
        })
      } catch (error) {
        console.error("Error fetching post:", error)
        setError("Failed to load post. It may have been deleted or the link has expired.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [linkId])

  const handleEditPost = async (id: string, content: string): Promise<void> => {
    try {
      const data = await apiFetch<IPost>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      })
      
      if (!data) {
        toast.error("Failed to update post")
        throw new Error("Failed to update post")
      }
      
      // setCurrentPost({
      //   ...data,
      //   authorName: currentPost?.authorName
      // })
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error("Failed to update post")
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !currentPost) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p>{error || "The post you are looking for may have been deleted or the link has expired."}</p>
        </div>
      </div>
    )
  }

  const isAuthor = contextData?.userData && contextData.userData.id === currentPost.authorId

  return (
    <EditingContext.Provider value={{ activeEditPostId, setActiveEditPostId }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shared Post from {currentPost.authorName}</h1>
        <PostItem 
            post={currentPost} 
            showShare={!!isAuthor}
            onEdit={handleEditPost}
            liveView
          />
      </div>
    </EditingContext.Provider>
  )
}