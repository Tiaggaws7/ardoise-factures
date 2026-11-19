import Link from "next/link";
import { brand } from "@/config/site";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#0c1f4a" />
      <path d="M18 40c6-14 10-20 14-20s2 14 6 14 5-6 8-10" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="17" y="46" width="30" height="4" rx="2" fill="#4f86ff" />
    </svg>
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label={`${brand.name} — accueil`}>
      <LogoMark />
      <span className={`h-display text-[22px] font-semibold ${light ? "text-chalk" : "text-ink"}`}>{brand.name}</span>
    </Link>
  );
}
