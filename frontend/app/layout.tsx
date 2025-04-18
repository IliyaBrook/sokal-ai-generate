import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "highlight.js/scss/atom-one-dark.scss";
import { NavBar } from "@/components/ui/NavBar";
import { UserDataProvider } from "@/contexts/UserData.context";
import React from 'react'
import { Toaster } from "sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'),
  title: {
    template: '%s | AI Content Generator',
    default: 'AI Content Generator',
  },
  description: "AI-powered web application that helps you generate dynamic content using advanced AI technology.",
  keywords: ["AI", "content generation", "artificial intelligence", "writing", "posts"],
  authors: [{ name: 'AI Content Generator Team' }],
  creator: 'AI Content Generator Team',
  publisher: 'AI Content Generator',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'ru-RU': '/ru',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AI Content Generator',
    description: 'AI-powered web application that helps you generate dynamic content using advanced AI technology.',
    siteName: 'AI Content Generator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Content Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Generator',
    description: 'AI-powered web application that helps you generate dynamic content using advanced AI technology.',
    images: ['/og-image.jpg'],
    creator: '@aicontentgen',
    site: '@aicontentgen',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserDataProvider>
          <NavBar />
          {children}
        </UserDataProvider>
        <Toaster richColors position="bottom-center"/>
      </body>
    </html>
  );
}
