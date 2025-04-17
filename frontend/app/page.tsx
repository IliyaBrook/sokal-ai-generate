import { PostItem } from '@/components/posts'
import type { IPost } from '@sokal_ai_generate/shared-types'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Home | AI Content Generator'
  const homeDescr = 'AI-powered content generation platform that helps you create unique and engaging content using advanced AI technology.'
  return {
    title: 'Home | AI Content Generator',
    description: homeDescr,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Published Content',
      description: homeDescr,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'AI Content Generator',
        },
      ],
      type: 'website',
      url: '/',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: homeDescr,
      images: ['/og-image.jpg'],
    }
  };
}

const getPublicPosts = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/public`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
};

export default async function Home() {
  const posts = await getPublicPosts();

  return (
    <>
      <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <section className="w-full py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">AI-Powered Content Generation</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              This is an AI-powered web application that helps you generate dynamic content.
              Our platform uses advanced AI technology to create unique and engaging content based on your preferences.
            </p>
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Published Content</h2>
            <p className="text-gray-600 text-lg">Explore AI-generated posts shared by our community</p>
          </div>
          {posts.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-lg shadow-sm">
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
        </section>
      </main>
    </>
  );
}