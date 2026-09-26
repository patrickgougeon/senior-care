"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#inicio",        label: "Início",          active: true  },
  { href: "#como-funciona", label: "Como funciona",   active: false },
  { href: "#beneficios",    label: "Benefícios",      active: false },
  { href: "#para-quem",     label: "Para quem",       active: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900">
          SeniorCare
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-neutral-900 ${
                link.active
                  ? "border-b-2 border-neutral-900 pb-0.5 font-semibold text-neutral-900"
                  : "font-medium text-neutral-500"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side — desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <button aria-label="Buscar" className="p-1.5 text-neutral-500 transition hover:text-neutral-900">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link href="/login" className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900 px-2">
            Entrar
          </Link>
          <Link href="/register" className="btn-primary px-5 py-2.5">
            Criar conta
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button className="p-2 text-neutral-700 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="bg-sand-100/95 backdrop-blur-md border-t border-sand-200 px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-neutral-700 hover:bg-sand-200"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" className="py-3 text-center text-sm font-medium text-neutral-500">Entrar</Link>
            <Link href="/register" className="btn-primary justify-center py-3">Criar conta</Link>
          </div>
        </div>
      )}
    </header>
  );
}
