import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import HeroSection from "../components/Home/HeroSection";
import StatsStrip from "../components/Home/StatsStrip";
import FeatureCards from "../components/Home/FeatureCards";
import HowItWorks from "../components/Home/HowItWorks";
import Testimonals from "../components/Home/Testimonals";
import PowerfulFeatures from "../components/Home/PowerfulFeatures";
import CTASection from "../components/Home/CTASection";
import Footer from "../components/Footer";

const HotAuctions = lazy(() => import("../components/Home/HotAuctions"));

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
        <FeatureCards />
        <HowItWorks />
        <Testimonals />
        <PowerfulFeatures />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
