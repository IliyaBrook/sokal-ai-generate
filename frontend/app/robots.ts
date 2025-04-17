import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/users/posts',
        '/shared/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}