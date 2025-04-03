/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // If your repository name is different from 'sprint-planner',
  // update the basePath to match your repository name
  basePath: process.env.NODE_ENV === 'production' ? '/sprint-planner' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

