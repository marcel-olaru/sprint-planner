let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}
// Check if we're building for GitHub Pages
const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Added for GitHub Pages deployment
  output: isGitHubPages ? 'export' : undefined,
  // Only apply these settings when building for GitHub Pages
  ...(isGitHubPages ? {
    basePath: '/sprint-planner',
    assetPrefix: '/sprint-planner/',
    // Handle API routes with static export
    distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next',
    trailingSlash: true,
  } : {})
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
