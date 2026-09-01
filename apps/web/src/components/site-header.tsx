"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    lastScrollPosition.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollPosition = Math.max(window.scrollY, 0);

      if (currentScrollPosition <= 72) {
        setHidden(false);
        lastScrollPosition.current = currentScrollPosition;
        return;
      }

      if (Math.abs(currentScrollPosition - lastScrollPosition.current) < 8) return;

      setHidden(currentScrollPosition > lastScrollPosition.current);
      lastScrollPosition.current = currentScrollPosition;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-header${hidden ? " is-hidden" : ""}`}>
      <div className="page-container header-inner">
        <Link className="brand" href="/" aria-label="Esmeralda — página inicial">
          <span className="brand-symbol" aria-hidden="true">
            <Image src="/images/emerald-outline-logo-clean.svg" alt="" width={28} height={28} priority />
          </span>
          <span>Esmeralda</span>
        </Link>
        <nav aria-label="Navegação principal">
          <span className="system-status"><i /> Sistema online</span>
          <Link href="/relatorios">Relatórios</Link>
        </nav>
      </div>
    </header>
  );
}
