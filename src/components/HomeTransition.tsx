"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';

import Signature from './Signature';

export interface HomeTransitionHandle {
  play: () => Promise<void>;
  kill: () => void;
}

const HomeTransition = forwardRef<HomeTransitionHandle>(function HomeTransition(_, ref) {
  const [visible, setVisible] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  // Run GSAP only after React has committed the DOM (visible === true)
  useEffect(() => {
    if (!visible) return;

    const path = document.querySelector<SVGPathElement>('#signature-path');
    if (!path) {
      resolveRef.current?.();
      resolveRef.current = null;
      return;
    }

    const pathLength = path.getTotalLength();
    path.style.setProperty('--path-length', pathLength.toString());
    gsap.set(path, { strokeDashoffset: pathLength });

    const tl = gsap.timeline({ delay: 0.5 });

    tl.to(path, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.inOut',
    })
      .add(() => setIsShrinking(true), '+=0.5')
      .add(() => {
        setVisible(false);
        resolveRef.current?.();
        resolveRef.current = null;
      }, '+=0.6');

    tlRef.current = tl;
  }, [visible]);

  useImperativeHandle(ref, () => ({
    play() {
      return new Promise<void>((resolve) => {
        tlRef.current?.kill();
        resolveRef.current = resolve;
        setIsShrinking(false);
        setVisible(true);
      });
    },

    kill() {
      tlRef.current?.kill();
      resolveRef.current = null;
      setVisible(false);
      setIsShrinking(false);
    },
  }));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-screen"
          className="loading-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        >
          <div className={`signature ${isShrinking ? 'shrinking' : ''}`}>
            <Signature />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default HomeTransition;
