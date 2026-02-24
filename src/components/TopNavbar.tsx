"use client";

import Link from 'next/link';
import Signature from './Signature';

interface TopNavbarProps {
  visible: boolean;
}

export default function TopNavbar({ visible }: TopNavbarProps) {
  return (
    <div
      className="top-logo"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Link href="/" className="top-logo-link" aria-label="Home">
        <Signature />
      </Link>
    </div>
  );
}
