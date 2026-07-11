import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { NexusNoticeContainer } from '@/components/ui/NexusNotice';
import BlobBackground from '@/components/ui/BlobBackground';

export const metadata: Metadata = {
  title: 'RepoSight — AI-Powered Developer Audit',
  description: 'Know your code. Know yourself. AI-powered analysis meets real developer insights.',
  keywords: ['code audit', 'developer tools', 'AI analysis', 'GitHub', 'code quality'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-white antialiased" suppressHydrationWarning>
        <BlobBackground />
        <NexusNoticeContainer />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
