'use client'

import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="w-full h-screen flex flex-col justify-center items-center text-center p-5 bg-gray-50 text-gray-800">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-red-600">Critical Error</h2>
            <p className="text-lg mb-2 text-gray-700">We're sorry, but something went seriously wrong.</p>
            <p className="text-sm mb-6 text-gray-500">
              {process.env.NODE_ENV === 'development' 
                ? `Error: ${error.message}` 
                : 'A critical error has occurred in the application.'}
            </p>
            {error.digest && (
              <p className="text-xs mb-6 text-gray-400">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex justify-center">
              <button
                onClick={() => reset()}
                className="bg-blue-600 text-white px-5 py-2.5 rounded cursor-pointer transition-colors duration-300 hover:bg-blue-700"
              >
                Try to recover
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}