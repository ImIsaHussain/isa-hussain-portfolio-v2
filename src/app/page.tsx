"use client";

import { useRef } from 'react';
import HeroShader from '@/components/HeroShader';
import HeroAnimations from '@/components/HeroAnimations';

export default function Home() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  return (
    <main>
      <HeroAnimations nameRef={nameRef} taglineRef={taglineRef} />
      <section className="hero">
        <HeroShader />
        <div className="hero-content">
          <h1 ref={nameRef} className="hero-name">ISA HUSSAIN</h1>
          <p ref={taglineRef} className="hero-tagline">I build things worth noticing.</p>
        </div>
      </section>
    </main>
  );
}
