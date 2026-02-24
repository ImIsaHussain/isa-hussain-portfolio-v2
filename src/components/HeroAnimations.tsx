"use client";

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useTransitionContext } from './TransitionContext';

gsap.registerPlugin(SplitText);

interface HeroAnimationsProps {
  nameRef: RefObject<HTMLHeadingElement | null>;
  taglineRef: RefObject<HTMLParagraphElement | null>;
}

export default function HeroAnimations({ nameRef, taglineRef }: HeroAnimationsProps) {
  const { onHomeReady, bottomNavRef } = useTransitionContext();

  useEffect(() => {
    const heroName = nameRef.current;
    const heroTagline = taglineRef.current;
    const navEl = bottomNavRef.current;
    const bottomLinks = navEl
      ? navEl.querySelectorAll<HTMLElement>('.bottom-navbar-link')
      : [];

    if (!heroName || !heroTagline) return;

    gsap.set([heroName, heroTagline], { opacity: 0 });
    gsap.set(bottomLinks, { opacity: 0 });

    const unsubscribe = onHomeReady(() => {
      gsap.set([heroName, heroTagline], { opacity: 1 });

      const splitName = SplitText.create(heroName, {
        type: 'chars,words',
        mask: 'words',
      });

      const splitTagline = SplitText.create(heroTagline, {
        type: 'lines',
        mask: 'lines',
      });

      const tl = gsap.timeline();

      tl.from(splitName.chars, {
        duration: 0.6,
        yPercent: gsap.utils.wrap([-150, 150]),
        xPercent: gsap.utils.wrap([-150, 150]),
        stagger: {
          from: 'random',
          amount: 0.6,
        },
        ease: 'power3.out',
      })
        .from(
          splitTagline.lines,
          {
            autoAlpha: 0,
            y: 25,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .to(
          bottomLinks,
          {
            opacity: 1,
            duration: 1.2,
            ease: 'power1.inOut',
            stagger: { from: 'center', each: 0.12 },
          },
          '-=0.2'
        );
    });

    return unsubscribe;
  }, [nameRef, taglineRef, onHomeReady, bottomNavRef]);

  return null;
}
