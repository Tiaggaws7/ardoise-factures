"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children, mobile }: { href: string; children: React.ReactNode; mobile?: boolean }) {
  const path = usePathname();
  const active = path === href || path.startsWith(`${href}/`);
  if (mobile)
    return (
      <Link href={href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-medium ${active ? "text-accent" : "text-muted"}`} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    );
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${active ? "bg-slate text-chalk shadow-card" : "text-ink/70 hover:bg-paper hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}
