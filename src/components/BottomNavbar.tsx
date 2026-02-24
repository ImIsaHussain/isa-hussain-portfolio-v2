"use client";

import { forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavbarProps {
  visible: boolean;
}

const BottomNavbar = forwardRef<HTMLElement, BottomNavbarProps>(
  function BottomNavbar({ visible }, ref) {
    const pathname = usePathname();

    return (
      <nav
        ref={ref}
        className="bottom-navbar"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      >
        <ul className="bottom-navbar-links">
          <li>
            <Link
              href="/"
              className={`bottom-navbar-link${pathname === '/' ? ' active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={`bottom-navbar-link${pathname === '/about' ? ' active' : ''}`}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/projects"
              className={`bottom-navbar-link${pathname === '/projects' ? ' active' : ''}`}
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={`bottom-navbar-link${pathname === '/contact' ? ' active' : ''}`}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
);

export default BottomNavbar;
