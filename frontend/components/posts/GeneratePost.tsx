import { useState } from 'react'
import { Button } from '../ui'

interface GeneratePostProps {
  userId: string
  onPostGenerated: () => void
}

export const GeneratePost = ({ userId, onPostGenerated }: GeneratePostProps) => {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!topic || !style) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, style }),
      })

      const generatedPost = await response.json()

      await fetch('/api/posts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...generatedPost,
          authorId: userId,
        }),
      })

      onPostGenerated()
      setTopic('')
      setStyle('')
    } catch (error) {
      console.error('Error generating post:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mb-8 p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Generate New Post</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter topic"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Style
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter writing style"
          />
        </div>
        <Button
          variant="secondary"
          onClick={handleGenerate}
          disabled={isGenerating || !topic || !style}
          //className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : 'Generate Post'}
        </Button>
      </div>
    </div>
  )
}