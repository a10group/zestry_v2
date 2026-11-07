"use client";

import Link from "next/link";
import { marketingNavLinks } from "@/config/nav";

interface MobileMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
  isActive: (path: string) => boolean;
}

export function MobileMenu({ isOpen, closeMenu, isActive }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      id="mobile-menu"
      className="md:hidden border-t border-neutral-200/50 bg-neutral-50 dark:border-emerald-950/40 dark:bg-[#121a16] shadow-xl transition-all duration-200"
    >
      <div className="space-y-1 px-4 pt-3 pb-4">
        {marketingNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
              isActive(link.href)
                ? "bg-[#84cc16]/10 text-[#84cc16]"
                : "hover:bg-neutral-100 dark:hover:bg-emerald-900/20"
            }`}
          >
            {link.label}
          </Link>
        ))}

        <div className="my-3 border-t border-neutral-200/60 dark:border-emerald-950/40" />

        <Link
          href="/login"
          onClick={closeMenu}
          className="block rounded-lg px-3 py-2.5 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-emerald-900/20 transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/book-a-call"
          onClick={closeMenu}
          className="mt-2 block w-full text-center rounded-lg bg-[#84cc16] px-4 py-3 text-base font-semibold text-neutral-900 shadow-sm transition-all active:scale-[0.98]"
        >
          Book a Call
        </Link>
      </div>
    </div>
  );
}
