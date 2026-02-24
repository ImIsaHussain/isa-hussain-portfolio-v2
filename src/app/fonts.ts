import { Cormorant_Garamond, Inter } from 'next/font/google';

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant-garamond',
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
