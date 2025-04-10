'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

export default function NotFound(): React.ReactElement {
  const router = useRouter()
  
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center text-center p-5 bg-gray-50 text-gray-800">
      <h1 className="text-4xl font-bold mb-5">Page Not Found</h1>
      <p className="text-lg mb-8">The page you are looking for does not exist.</p>
      <button 
        className="bg-blue-600 text-white px-5 py-2.5 rounded cursor-pointer transition-colors duration-300 hover:bg-blue-700"
        onClick={() => router.push(`/`)}
      >
        Go to Home Page
      </button>
    </div>
  )
}