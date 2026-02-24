"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import HomeTransition, { type HomeTransitionHandle } from './HomeTransition';
import WipeTransition, { type WipeTransitionHandle } from './WipeTransition';
import TopNavbar from './TopNavbar';
import BottomNavbar from './BottomNavbar';
import { TransitionContext, useTransitionProvider } from './TransitionContext';

type Phase = 'idle' | 'covering' | 'revealing';

export default function Transition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);
  const pendingNavRef = useRef<string | null>(null);

  const homeRef = useRef<HomeTransitionHandle>(null);
  const wipeRef = useRef<WipeTransitionHandle>(null);

  const phaseRef = useRef<Phase>('covering');
  const [navbarVisible, setNavbarVisible] = useState(false);

  const { contextValue, emitHomeReady, bottomNavRef } = useTransitionProvider();

  // Intercept link clicks to subpages — play wipe cover BEFORE navigating
  // so the old page stays visible while strips cover the screen.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      if (href === pathname) return;
      if (href === '/') return; // home route uses its own transition
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (pendingNavRef.current) return;

      // Stop Next.js <Link> from navigating immediately
      e.preventDefault();
      e.stopPropagation();

      pendingNavRef.current = href;
      cancelledRef.current = false;

      // Don't change phase/navbar here — the current page content must stay
      // fully visible while the wipe strips cover the screen.
      wipeRef.current?.playIn().then(() => {
        if (!cancelledRef.current) router.push(href);
      });
    };

    // Capture phase fires before the <Link>'s own handler
    el.addEventListener('click', onClick, true);
    return () => el.removeEventListener('click', onClick, true);
  }, [pathname, router]);

  // React to actual route changes
  useEffect(() => {
    const isHome = pathname === '/';
    const home = homeRef.current;
    const wipe = wipeRef.current;

    home?.kill();
    wipe?.kill();

    let cancelled = false;

    if (pendingNavRef.current) {
      // Intercepted navigation — cover already played, just reveal
      pendingNavRef.current = null;

      setTimeout(() => {
        if (!cancelled) {
          phaseRef.current = 'revealing';
          setNavbarVisible(true);
          wipe?.playOut().then(() => {
            if (!cancelled) phaseRef.current = 'idle';
          });
        }
      }, 0);
    } else if (isHome) {
      // Home route (first load or link to /)
      phaseRef.current = 'covering';
      queueMicrotask(() => {
        if (cancelled) return;
        setNavbarVisible(false);
      });

      home?.play().then(() => {
        if (!cancelled) {
          phaseRef.current = 'idle';
          setNavbarVisible(true);
          emitHomeReady();
        }
      });
    } else {
      // Direct subpage load (first load, browser back/forward)
      phaseRef.current = 'covering';
      queueMicrotask(() => {
        if (cancelled) return;
        setNavbarVisible(true);
      });

      wipe?.playIn().then(() => {
        if (cancelled) return;
        phaseRef.current = 'revealing';
        wipe?.playOut().then(() => {
          if (!cancelled) phaseRef.current = 'idle';
        });
      });
    }

    return () => {
      cancelled = true;
      home?.kill();
      wipe?.kill();
    };
  }, [pathname, emitHomeReady]);

  return (
    <TransitionContext.Provider value={contextValue}>
      <div ref={wrapperRef}>
        <HomeTransition ref={homeRef} />
        <WipeTransition ref={wipeRef} />

        <TopNavbar visible={navbarVisible} />
        <BottomNavbar ref={bottomNavRef} visible={navbarVisible} />

        <div key={pathname}>
          {children}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
