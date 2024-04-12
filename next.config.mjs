/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      remotePatterns: [
        {
            protocol: 'https',
            hostname: 'cdn.discordapp.com',
            pathname: '/avatars/*/**',
        },
        {
            protocol: 'https',
            hostname: 'api.weather.gov',
            pathname: '/*/**',
        }
      ]
  }
};

export default nextConfig;
