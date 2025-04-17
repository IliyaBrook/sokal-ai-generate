import UserPosts from "./userPosts";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Posts',
  description: 'Manage and create your AI-generated content. Generate new posts and view your existing content.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/users/posts',
  },
};

export default async function PostsPage() {
  return <UserPosts/>
} 
