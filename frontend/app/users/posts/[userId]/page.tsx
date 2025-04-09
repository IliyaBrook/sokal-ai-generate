import UserPosts from "./userPosts";

interface PostsPageProps {
  params: {
    userId: string
  }
}

export default async function PostsPage({ params }: PostsPageProps) {
  // Todo userId to static generation for ssr
  const { userId } = await params


  return <UserPosts/>
} 