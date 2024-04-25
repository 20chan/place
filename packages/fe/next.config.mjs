/** @type {import('next').NextConfig} */
const nextConfig = (phase) => {
  const isProd = (
    process.env.NODE_ENV === 'production'
    || phase === 'phase-production-build'
    || phase === 'phase-production-server'
  );

  return {
    distDir: isProd ? '.next' : '.next.dev',
  }
};

export default nextConfig;
