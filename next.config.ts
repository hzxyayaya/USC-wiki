import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';

const isProdBuild = process.env.npm_lifecycle_event === 'build';

const nextConfig: NextConfig = {
	...(isProdBuild ? { output: 'export' } : {}),
	trailingSlash: true,
	reactStrictMode: true,
	pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
	images: {
		unoptimized: true,
	},
};

const withMDX = createMDX();

export default withMDX(nextConfig);
