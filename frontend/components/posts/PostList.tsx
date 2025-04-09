import { IPost } from '@/types'
import { PostItem } from './PostItem'

export const PostList = ({ posts }: { posts: IPost[] }) => {
  const handlePublish = async (postId: string) => {
    try {
      await fetch('/api/posts/published', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })
      window.location.reload()
    } catch (error) {
      console.error('Error publishing post:', error)
    }
  }
  
  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostItem 
          key={post.id} 
          post={post} 
          onPublish={handlePublish} 
        />
      ))}
    </div>
  )
}