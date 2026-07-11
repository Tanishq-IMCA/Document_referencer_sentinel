/** @type {import('next').NextConfig} */

const replitDomains = process.env.REPLIT_DOMAINS
  ? process.env.REPLIT_DOMAINS.split(',').map(d => d.trim())
  : [];

const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    ...replitDomains,
    '*.replit.dev',
    '*.repl.co',
    '*.pike.replit.dev',
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
