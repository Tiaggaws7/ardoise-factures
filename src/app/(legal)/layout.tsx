import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";
import { Logo } from "@/components/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBanner />
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink"><ArrowLeft size={15} /> Accueil</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-14">
        <article className="space-y-4 leading-relaxed text-ink/80 [&_h1]:h-display [&_h1]:mb-2 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:text-ink [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_strong]:text-ink">
          {children}
        </article>
      </main>
    </>
  );
}
