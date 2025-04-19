'use client'

import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center text-center p-5 bg-gray-50 text-gray-800">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-4 text-red-600">Something went wrong!</h2>
        <p className="text-lg mb-2 text-gray-700">We apologize for the inconvenience.</p>
        <p className="text-sm mb-6 text-gray-500">
          {process.env.NODE_ENV === 'development' 
            ? `Error: ${error.message}` 
            : 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="text-xs mb-6 text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded cursor-pointer transition-colors duration-300 hover:bg-blue-700"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded cursor-pointer transition-colors duration-300 hover:bg-gray-300"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  )
}