import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://aorthar.academy'),
  title: 'Aorthar Academy',
  description:
    'Open-source, university-structured learning for designers, engineers, and product thinkers.',
  icons: {
    icon: [
      { url: '/Aorthar Favion.svg', type: 'image/svg+xml' },
      { url: '/icon-park_like.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/icon-park_like.svg'],
    apple: [{ url: '/Aorthar Favion.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'Aorthar Academy',
    description:
      'Open-source, university-structured learning for designers, engineers, and product thinkers.',
    images: ['/Banner.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aorthar Academy',
    description:
      'Open-source, university-structured learning for designers, engineers, and product thinkers.',
    images: ['/Banner.png'],
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
