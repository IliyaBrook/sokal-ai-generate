import { Button } from "@/components/ui/button";
import Link from "next/link";

const getPublicPosts = async () => {
  const response = await fetch('/api/posts/public')
  const data = await response.json()
  return data
}

export default async function Home() {

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Welcome to AI Content Generator</h1>
        <p className="text-lg text-gray-600 mb-4">
          This is an AI-powered web application that helps you generate dynamic content. 
          Our platform uses advanced AI technology to create unique and engaging content based on your preferences.
        </p>
        <div className="text-center">
          <Link href="/sign-up">
            <Button >Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
