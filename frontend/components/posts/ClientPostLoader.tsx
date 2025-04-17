'use client';

import { useEffect, useState } from 'react';
import { IPost } from '@/types';
import { PostItem } from '.';

interface ClientPostLoaderProps {
  initialPosts: IPost[];
}

export default function ClientPostLoader({ initialPosts }: ClientPostLoaderProps) {
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  const [loading, setLoading] = useState<boolean>(initialPosts.length === 0);

  useEffect(() => {
    if (initialPosts.length > 0) {
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/public`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts on client:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts.length]);

  if (loading) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Загрузка публикаций...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Нет доступных публикаций в данный момент.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
      {posts.map((post: IPost) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
          <PostItem post={post} className="w-full" />
        </div>
      ))}
    </div>
  );
}
