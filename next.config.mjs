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
        },
        {
          protocol: 'https',
          hostname: 'oaidalleapiprodscus.blob.core.windows.net',
          pathname: '/private/org-CSWTNfA9G9Das80CQss5HC08/*/**',
        }
      ]
  }
};

export default nextConfig;
