"use client";

/* eslint-disable @next/next/no-img-element -- static export, next/image not available */

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '@/data/projects';

gsap.registerPlugin(ScrollTrigger);

const EXPAND_DURATION = 0.5;
const COLLAPSE_DURATION = 0.4;
const SCROLL_REVEAL_DURATION = 0.6;
const SCROLL_REVEAL_OFFSET = 40;
const SCROLL_TO_OFFSET = 0.15; // 15% from top of viewport

export default function Projects() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [gridCols, setGridCols] = useState(2);
  const gridRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  const killScrollTriggers = useCallback(() => {
    scrollTriggersRef.current.forEach((st) => st.kill());
    scrollTriggersRef.current = [];
  }, []);

  const handleExpand = useCallback((id: string) => {
    if (expandedId === id) {
      // Collapse
      killScrollTriggers();
      const content = expandedContentRef.current;
      if (content) {
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: COLLAPSE_DURATION,
          ease: 'power2.inOut',
          onComplete: () => setExpandedId(null),
        });
      } else {
        setExpandedId(null);
      }
    } else {
      killScrollTriggers();
      setHeroSlide(0);
      setExpandedId(id);
    }
  }, [expandedId, killScrollTriggers]);

  useEffect(() => {
    const contentEl = expandedContentRef.current;
    if (expandedId && contentEl) {
      const content = contentEl;
      // Measure natural height
      content.style.height = 'auto';
      const naturalHeight = content.offsetHeight;
      content.style.height = '0px';

      // Collect all animatable elements inside the expanded text
      const textContainer = content.querySelector('.project-expanded-text');
      const animElements: Element[] = [];
      if (textContainer) {
        animElements.push(
          ...textContainer.querySelectorAll(
            '.project-expanded-title, .project-expanded-role, .project-expanded-body > p, .project-expanded-body > .project-expanded-inline-img, .project-expanded-links'
          )
        );
      }

      // Set initial hidden state
      if (animElements.length > 0) {
        gsap.set(animElements, { opacity: 0, y: SCROLL_REVEAL_OFFSET });
      }

      gsap.to(content, {
        height: naturalHeight,
        opacity: 1,
        duration: EXPAND_DURATION,
        ease: 'power2.out',
        onComplete: () => {
          // Remove fixed height so content reflows naturally
          content.style.height = 'auto';

          // Set up scroll-triggered animations for each element
          animElements.forEach((el) => {
            const st = ScrollTrigger.create({
              trigger: el,
              start: 'top 90%',
              once: true,
              onEnter: () => {
                gsap.to(el, {
                  opacity: 1,
                  y: 0,
                  duration: SCROLL_REVEAL_DURATION,
                  ease: 'power2.out',
                });
              },
            });
            scrollTriggersRef.current.push(st);
          });

          ScrollTrigger.refresh();
        },
      });

      // Scroll the expanded card into view after layout settles
      const card = content.closest('.project-card-expanded');
      if (card) {
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const offset = window.innerHeight * SCROLL_TO_OFFSET;
          window.scrollBy({
            top: rect.top - offset,
            behavior: 'smooth',
          });
        });
      }
    }

    return () => {
      gsap.killTweensOf(contentEl);
    };
  }, [expandedId]);

  // Detect grid column count
  useEffect(() => {
    const updateCols = () => {
      if (gridRef.current) {
        const cols = getComputedStyle(gridRef.current)
          .gridTemplateColumns.split(' ').length;
        setGridCols(cols);
      }
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => killScrollTriggers();
  }, [killScrollTriggers]);

  // Build grid items: cards in order, with expanded detail injected after the row
  const expandedProject = projects.find((p) => p.id === expandedId);
  const expandedIndex = expandedProject
    ? projects.indexOf(expandedProject)
    : -1;
  // Which row does the expanded card sit in?
  const expandedRow = expandedIndex >= 0 ? Math.floor(expandedIndex / gridCols) : -1;
  // Insert expanded detail after the last card in that row
  const rowEnd = expandedRow >= 0 ? expandedRow * gridCols + (gridCols - 1) : -1;
  const insertAfterIndex =
    rowEnd >= 0 ? Math.min(rowEnd, projects.length - 1) : -1;

  const items: React.ReactNode[] = [];
  projects.forEach((project, i) => {
    const isExpanded = project.id === expandedId;

    items.push(
      <button
        key={project.id}
        className={`project-card${isExpanded ? ' project-card--active' : ''}`}
        onClick={() => handleExpand(project.id)}
        aria-label={`View ${project.title}`}
        aria-expanded={isExpanded}
      >
        <div className="project-card-image">
          {project.nda ? (
            <div className="project-card-nda">
              <span className="project-card-nda-label">NDA</span>
            </div>
          ) : project.image ? (

            <img src={project.image} alt={project.title} />
          ) : (
            <div className="project-card-placeholder" />
          )}
        </div>
        <div className="project-card-body">
          <h2 className="project-card-title">{project.title}</h2>
          <p className="project-card-desc">{project.shortDesc}</p>
        </div>
      </button>
    );

    // Insert expanded detail panel after the last card in the row
    if (i === insertAfterIndex && expandedProject) {
      items.push(
        <div key={expandedProject.id + '-expanded'} className="project-card-expanded">
          <div
            className="project-expanded-content"
            ref={expandedContentRef}
          >
            <div className="project-expanded-inner">
              {/* Hero image / carousel */}
              {expandedProject.heroImages &&
                expandedProject.heroImages.length > 0 && (
                  <div className="project-expanded-hero">
                    {expandedProject.heroImages.length > 1 && (
                      <button
                        className="project-expanded-hero-btn project-expanded-hero-btn--prev"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeroSlide((prev) =>
                            prev === 0
                              ? expandedProject.heroImages!.length - 1
                              : prev - 1
                          );
                        }}
                        aria-label="Previous image"
                      >
                        <svg viewBox="0 0 24 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="18,5 6,50 18,95" />
                        </svg>
                      </button>
                    )}
                    <div className="project-expanded-hero-viewport">
                      <div
                        className="project-expanded-hero-track"
                        style={{
                          transform: `translateX(-${heroSlide * 100}%)`,
                        }}
                      >
                        {expandedProject.heroImages.map((src, idx) => (
                          <div key={idx} className="project-expanded-hero-slide">

                            <img
                              src={src}
                              alt={`${expandedProject.title} hero ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      {expandedProject.heroImages.length > 1 && (
                        <div className="project-expanded-hero-dots">
                          {expandedProject.heroImages.map((_, idx) => (
                            <button
                              key={idx}
                              className={`project-expanded-hero-dot${
                                idx === heroSlide
                                  ? ' project-expanded-hero-dot--active'
                                  : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setHeroSlide(idx);
                              }}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {expandedProject.heroImages.length > 1 && (
                      <button
                        className="project-expanded-hero-btn project-expanded-hero-btn--next"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeroSlide((prev) =>
                            prev === expandedProject.heroImages!.length - 1
                              ? 0
                              : prev + 1
                          );
                        }}
                        aria-label="Next image"
                      >
                        <svg viewBox="0 0 24 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="6,5 18,50 6,95" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

              <div className="project-expanded-text">
                <h2 className="project-expanded-title">
                  {expandedProject.title}
                </h2>

                {expandedProject.role && (
                  <p className="project-expanded-role">
                    {expandedProject.role}
                  </p>
                )}

                {/* Content blocks: text + inline images */}
                <div className="project-expanded-body">
                  {expandedProject.content?.map((block, idx) =>
                    block.type === 'text' ? (
                      <p key={idx}>{block.content}</p>
                    ) : (
                      <div key={idx} className="project-expanded-inline-img">
                        <img src={block.src} alt={block.alt || ''} />
                      </div>
                    )
                  )}

                  {/* Fallback for projects using old longDesc */}
                  {!expandedProject.content &&
                    expandedProject.longDesc
                      ?.split('\n\n')
                      .map((para, idx) => <p key={idx}>{para}</p>)}
                </div>

                {expandedProject.links &&
                  expandedProject.links.length > 0 && (
                    <div className="project-expanded-links">
                      {expandedProject.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-expanded-link"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  return (
    <main className="projects-page">
      <div className="projects-inner">
        <h1 className="projects-heading">Projects</h1>
        <div className="projects-grid" ref={gridRef}>
          {items}
          <Link href="/contact" className="projects-cta">
            <span className="projects-cta-text">Have a project in mind?</span>
            <span className="projects-cta-link">Get in touch &rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
