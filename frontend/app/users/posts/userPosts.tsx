"use client";

import { GeneratePost, UserPostList } from '@/components/posts'
import { SpinnerCentered } from '@/components/ui'
import { UserDataContext } from '@/contexts/UserData.context'
import { fetchWithRefresh } from '@/lib'
import { IPost } from '@/types'
import dynamic from 'next/dynamic'
import { Suspense, use, useContext, useState } from 'react'

const fetchPosts = 	fetchWithRefresh<IPost[]>({
  url: `/api/posts/user`,
});

function Posts() {
  const initialPosts = use(fetchPosts);
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  // const [isLoading, setIsLoading] = useState(true);
  const data = useContext(UserDataContext);
  const userName = [data?.userData?.firstname, data?.userData?.lastname]?.join(
    " "
  );
  // const apiFetch = useAuthUserFetch();
  // const fetchPosts = async () => {
  //   try {
  //     const data = await apiFetch<IPost[]>(`/api/posts/user`);
  //     console.log('UserPosts : ', data)
  //     setPosts(data);
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handlePostGenerated = (newPost: IPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // useEffect(() => {
  //   void fetchPosts();
  // }, []);

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       Loading...
  //     </div>
  //   );
  // }
  return (
    <div className="container mx-auto px-4 py-8">
      {userName && (
        <h1 className="text-3xl font-bold mb-8">Welcome, {userName}</h1>
      )}
      <GeneratePost onPostGeneratedAction={handlePostGenerated} />
      <UserPostList posts={posts} />
    </div>
  );
}

const UserPostsSuspended = () => {
  return (
    <Suspense fallback={<SpinnerCentered/>}>
      <Posts />
    </Suspense>
  );
};

const UserPosts = dynamic(() => Promise.resolve(UserPostsSuspended), { ssr: false })
export default UserPosts;