import type { Metadata } from 'next';
import { cormorantGaramond, inter } from '@/app/fonts';
import LenisProvider from '@/components/LenisProvider';
import Transition from '@/components/Transition';
import './globals.css';

export const metadata: Metadata = {
  title: 'Isa Hussain - Portfolio',
  description: 'The portfolio of Isa Hussain, a creative developer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorantGaramond.variable} ${inter.variable} antialiased`}>
        <LenisProvider>
          <Transition>{children}</Transition>
        </LenisProvider>
      </body>
    </html>
  );
}
