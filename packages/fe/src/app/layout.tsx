import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SocketProvider } from '@/components/socket';
import { SERVER_URL } from '@/lib/consts';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '@0ch/place',
  description: 'yet another clone of r/place',
};

export const viewport: Viewport = {
  userScalable: false,
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.className} overflow-hidden`}>
        <SocketProvider url={SERVER_URL} path='/api/socket'>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
