import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import HeroSection from "../components/Home/HeroSection";
import StatsStrip from "../components/Home/StatsStrip";

const HotAuctions = lazy(() => import("../components/Home/HotAuctions"));
const FeatureCards = lazy(() => import("../components/Home/FeatureCards"));
const HowItWorks = lazy(() => import("../components/Home/HowItWorks"));
const Testimonals = lazy(() => import("../components/Home/Testimonals"));
const PowerfulFeatures = lazy(() => import("../components/Home/PowerfulFeatures"));
const CTASection = lazy(() => import("../components/Home/CTASection"));
const Footer = lazy(() => import("../components/Footer"));

const DeferredSection = ({ children, minHeight = 280 }) => {
  const sectionRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldRender) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={sectionRef} style={{ minHeight: shouldRender ? undefined : minHeight }}>
      {shouldRender ? (
        <Suspense fallback={<div style={{ minHeight }} />}>{children}</Suspense>
      ) : null}
    </div>
  );
};

const Home = ({ theme, onToggleTheme }) => {
  return (
    <div className="site-shell">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <HeroSection />
        <StatsStrip />
        <DeferredSection minHeight={520}>
          <HotAuctions />
        </DeferredSection>
        <DeferredSection>
          <FeatureCards />
        </DeferredSection>
        <DeferredSection>
          <HowItWorks />
        </DeferredSection>
        <DeferredSection>
          <Testimonals />
        </DeferredSection>
        <DeferredSection>
          <PowerfulFeatures />
        </DeferredSection>
        <DeferredSection minHeight={220}>
          <CTASection />
        </DeferredSection>
      </main>
      <DeferredSection minHeight={260}>
        <Footer />
      </DeferredSection>
    </div>
  );
};

export default Home;
