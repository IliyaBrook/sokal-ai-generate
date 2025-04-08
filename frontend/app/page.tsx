import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Welcome to AI Content Generator</h1>
        <p className="text-lg text-gray-600 mb-4">
          This is an AI-powered web application that helps you generate dynamic content. 
          Our platform uses advanced AI technology to create unique and engaging content based on your preferences.
        </p>
        <p className="text-lg text-gray-600 mb-6">
          To get started, please register an account and add your OpenAI API key in the user settings. 
          This will enable you to generate high-quality content tailored to your needs.
        </p>
        <div className="text-center">
          <Link href="/sign-up">
            <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
