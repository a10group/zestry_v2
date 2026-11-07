"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { marketingNavLinks } from "@/config/nav";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-neutral-50/80 backdrop-blur-md dark:border-emerald-950/40 dark:bg-[#121a16]/80 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 font-bold text-xl tracking-tight group/logo"
            >
              <div className="overflow-hidden rounded-lg transition-transform duration-200 group-hover/logo:scale-105">
                <Image
                  src="/logo.png"
                  alt="Zestry Logo"
                  width={40}
                  height={40}
                  className="object-contain h-auto"
                  priority
                />
              </div>
              <span className="text-neutral-950 dark:text-white font-extrabold text-2xl tracking-tight">
                zestry
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            {marketingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 transition-colors duration-200 group ${
                  isActive(link.href)
                    ? "text-[#84cc16]"
                    : "hover:text-[#84cc16]"
                }`}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[#84cc16] transition-all duration-200 ${
                    isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Auth & CTA */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-[#84cc16] transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/book-a-call"
              className="rounded-lg bg-[#84cc16] px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:bg-[#a3e635] hover:scale-[1.02] active:scale-[0.98]"
            >
              Book a Call
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400  dark:hover:text-neutral-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={isOpen} closeMenu={closeMenu} isActive={isActive} />
    </nav>
  );
}
