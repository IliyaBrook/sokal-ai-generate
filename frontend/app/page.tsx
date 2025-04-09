import { PostItem } from "@/components/posts";
import { IPost } from "@/types";

const getPublicPosts = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${baseUrl}/api/posts/public`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching public posts:", error);
    return [];
  }
};

export default async function Home() {
  const posts = await getPublicPosts();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    
      {posts.map((post: IPost) => (
        <PostItem key={post.id} post={post} className="max-w-5xl" />
      ))}
    </main>
  );
}
