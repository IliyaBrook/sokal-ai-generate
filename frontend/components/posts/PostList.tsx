import { Post } from '@/types'

interface PostListProps {
  posts: Post[]
}

export const PostList = ({ posts }: PostListProps) => {
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
        <div key={post._id} className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
          <p className="text-gray-600 mb-4">{post.content}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {post.isPublished ? 'Published' : 'Draft'}
            </span>
            {!post.isPublished && (
              <button
                onClick={() => handlePublish(post._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Publish
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}