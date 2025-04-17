import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
			}
		]
	},
	headers: async () => {
		return [
			{
				source: '/api/:path*',
				headers: [
					{
						key: 'Access-Control-Allow-Origin',
						value: '*'
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
					},
					{
						key: 'Access-Control-Allow-Headers',
						value: 'Content-Type, Authorization'
					}
				]
			}
		]
	},
	eslint: {
		ignoreDuringBuilds: true
	}
}

module.exports = nextConfig