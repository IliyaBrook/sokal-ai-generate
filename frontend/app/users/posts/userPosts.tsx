'use client'

import { GeneratePost, PostList } from "@/components/posts";
import { IPost } from "@/types";
import { useEffect, useState } from "react";

export default function UserPosts() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/posts/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostGenerated = (newPost: IPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Posts</h1>
      <GeneratePost
        onPostGenerated={handlePostGenerated}
      />
      <PostList posts={posts} />
    </div>
  );
}
