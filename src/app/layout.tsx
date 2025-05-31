import './globals.css';
import type { Metadata } from 'next';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Trash Warriors: Street Rage',
  description: 'Clean the streets, earn rewards, save the world',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <BottomNav />
        <div className="h-20" />
      </body>
    </html>
  );
}
