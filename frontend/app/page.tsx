import ClientPostLoader from '@/components/posts/ClientPostLoader'

const getPublicPosts = async () => {
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    console.log('Skipping API call during build...');
    return [];
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/public`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching public posts:", error);
    return [];
  }
};

export default async function Home() {
  const initialPosts = await getPublicPosts();

  return (
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

        <ClientPostLoader initialPosts={initialPosts} />
      </section>
    </main>
  );
}
