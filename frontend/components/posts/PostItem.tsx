import { useState } from 'react';
import { IPost } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PostItemProps {
  post: IPost;
  onPublish: (postId: string) => Promise<any>;
  mode?: 'preview' | 'published';
}

export const PostItem = ({ post, onPublish, mode }: PostItemProps) => {
  const [isPublished, setIsPublished] = useState(post.isPublished);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await onPublish(post.id);
      console.log('Publish result:', result);
      setIsPublished(true);
    } catch (error) {
      console.error('Error publishing post:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>
          {isPublished ? 'Published' : 'Draft'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 whitespace-pre-line">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        {!isPublished && mode !== 'preview' && (
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer disabled:opacity-50"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        )}
      </CardFooter>
    </Card>
  );
}; 