'use client'

import { PostItem } from '@/components/posts'
import type { IPost } from '@sokal_ai_generate/shared-types'
import dynamic from 'next/dynamic'
import { use } from 'react'

async function getPublicPosts() {
	try {
		const response = await fetch(`api/posts/public`, {
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});
		if (!response.ok) {
			return [];
		}
		return await response.json();
	} catch (error) {
		return [];
	}
}

const postsPromise = getPublicPosts()

const Home = () => {
	
	const posts = use(postsPromise)
	
	return (
		<>
			{posts.length === 0 ? (
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
					<p className="text-gray-500">No published posts available at the moment.</p>
				</div>
			) : (
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
					{posts.map((post: IPost) => (
						<div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
							<PostItem post={post} className="w-full" />
						</div>
					))}
				</div>
			)}
		</>
	)
}

const HomePage = dynamic(
	() => Promise.resolve(Home),
	{ ssr: false }
);

export default HomePage;