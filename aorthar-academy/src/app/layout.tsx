import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('localhost')
    ? undefined
    : process.env.NEXTAUTH_URL) ??
  'https://aorthar.academy';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Aorthar Academy',
  description:
    'Open-source, university-structured learning for designers, engineers, and product thinkers.',
  icons: {
    icon: [
      { url: '/aorthar-favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-park_like.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/aorthar-favicon.svg'],
    apple: [{ url: '/aorthar-favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'Aorthar Academy',
    description:
      'Open-source, university-structured learning for designers, engineers, and product thinkers.',
    images: [
      {
        url: '/banner-og.png',
        width: 1200,
        height: 630,
        alt: 'Aorthar Academy - We train the next generation of product talent',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aorthar Academy',
    description:
      'Open-source, university-structured learning for designers, engineers, and product thinkers.',
    images: ['/banner-og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
