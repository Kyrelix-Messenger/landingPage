import { memo } from "react";
import { Appearance } from "@/widgets/appearance/Appearance";
import { Cta } from "@/widgets/cta/Cta";
import { Faq } from "@/widgets/faq/Faq";
import { Features } from "@/widgets/features/Features";
import { Hero } from "@/widgets/hero/Hero";
import { Languages } from "@/widgets/languages/Languages";
import { Roadmap } from "@/widgets/roadmap/Roadmap";

export const HomePage = memo(function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Appearance />
      <Languages />
      <Roadmap />
      <Faq />
      <Cta />
    </>
  );
});
