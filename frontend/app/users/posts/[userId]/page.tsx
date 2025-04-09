import UserPosts from "./userPosts";

interface PostsPageProps {
  params: {
    userId: string
  }
}

export default async function PostsPage({ params }: PostsPageProps) {
  const { userId } = await params


  return <UserPosts userId={userId as string} />
} 