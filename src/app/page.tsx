import { DemoBanner } from "@/components/demo-banner";
import { AppPreview } from "@/components/landing/app-preview";
import { Faq, FinalCta, Features, Footer, Header, Hero, Pricing, Steps, Templates } from "@/components/landing/sections";

export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <Hero preview={<AppPreview />} />
        <Features />
        <Steps />
        <Templates />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
