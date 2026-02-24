"use client";

import { ReactNode, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';

export default function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    // Home page is a single viewport with no scroll content
    if (pathname === '/') return;

    const instance = new Lenis({
      smoothWheel: true,
      lerp: 0.075,
    });

    lenisRef.current = instance;
    instance.scrollTo(0, { immediate: true });

    const raf = (time: number) => {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  return <>{children}</>;
}
