import Link from "next/link";
import type { ReactNode } from "react";

export function PublicInfoPage({
  eyebrow,
  title,
  intro,
  children
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="info-page">
      <header className="info-header">
        <Link href="/" className="info-brand" aria-label="MedPath home">
          MedPath
        </Link>
        <nav aria-label="Public navigation">
          <Link href="/pathfinder">PathFinder</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/">Home</Link>
        </nav>
      </header>

      <article className="info-content">
        <header className="info-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>
        <div className="info-sections">{children}</div>
      </article>

      <footer className="info-footer">
        <span>© 2026 MedPath</span>
        <nav aria-label="Legal navigation">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}

