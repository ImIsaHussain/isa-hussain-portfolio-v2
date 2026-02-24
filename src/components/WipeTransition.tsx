"use client";

import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';

const WIPE_COUNT = 10;
const DURATION = 0.8;

export interface WipeTransitionHandle {
  playIn: () => Promise<void>;
  playOut: () => Promise<void>;
  kill: () => void;
}

const WipeTransition = forwardRef<WipeTransitionHandle>(function WipeTransition(_, ref) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useImperativeHandle(ref, () => ({
    playIn() {
      return new Promise<void>((resolve) => {
        tlRef.current?.kill();
        gsap.set(overlayRef.current, { display: 'block' });
        const path = pathRef.current;
        if (!path) return resolve();

        const pathLength = path.getTotalLength();
        gsap.set(path, { strokeDashoffset: pathLength, strokeDasharray: pathLength });

        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(path, { strokeDashoffset: 0, duration: DURATION, ease: 'none' });
        tlRef.current = tl;
      });
    },

    playOut() {
      return new Promise<void>((resolve) => {
        tlRef.current?.kill();
        const path = pathRef.current;
        if (!path) return resolve();

        const pathLength = path.getTotalLength();

        const tl = gsap.timeline({ onComplete: () => {
          gsap.set(overlayRef.current, { display: 'none' });
          resolve();
        } });
        tl.to(path, { strokeDashoffset: -pathLength, duration: DURATION, ease: 'none' });
        tlRef.current = tl;
      });
    },

    kill() {
      tlRef.current?.kill();
    },
  }));

  const points = Array.from({ length: WIPE_COUNT + 1 }, (_, i) => {
    const y = i * (100 / WIPE_COUNT);
    const x = i % 2 === 0 ? 100 : 0;
    return `${x},${y}`;
  });

  const d = `M ${points[0]} L ${points.slice(1).join(' ')}`;

  return (
    <div ref={overlayRef} className="wipe-overlay" style={{ display: 'none' }}>
      <svg
        style={{ width: '100%', height: '100%' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d={d}
          stroke="rgb(var(--green))"
          strokeWidth={140 / WIPE_COUNT * 1.5} // Overlap to prevent gaps
          strokeLinecap="butt"
          fill="none"
        />
      </svg>
    </div>
  );
});

export default WipeTransition;
