import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/Home/HeroSection";
import StatsStrip from "../components/Home/StatsStrip";
import HotAuctions from "../components/Home/HotAuctions";
import FeatureCards from "../components/Home/FeatureCards";
import HowItWorks from "../components/Home/HowItWorks";
import Testimonals from "../components/Home/Testimonals";
import PowerfulFeatures from "../components/Home/PowerfulFeatures";
import CTASection from "../components/Home/CTASection";

const Home = ({ theme, onToggleTheme }) => {
  return (
    <div className="site-shell">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <HeroSection />
        <StatsStrip />
        <HotAuctions />
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
