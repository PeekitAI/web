import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Peekit DevPortal',
  description: 'Developer portal for managing crawling jobs and templates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className="font-sans">
        <div className="flex h-screen bg-background overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto ml-[280px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
