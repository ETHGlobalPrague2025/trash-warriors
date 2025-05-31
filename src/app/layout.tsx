import './globals.css';
import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
