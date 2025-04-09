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
  onPublish: (postId: string) => Promise<void>;
}

export const PostItem = ({ post, onPublish }: PostItemProps) => {
  return (
    <Card key={post.id}>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>
          {post.isPublished ? 'Published' : 'Draft'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        {!post.isPublished && (
          <button
            onClick={() => onPublish(post.id)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Publish
          </button>
        )}
      </CardFooter>
    </Card>
  );
}; 