import React, { useEffect } from "react";
import Header from "./WebsiteSections/Header";
import Slider from "./WebsiteSections/Slider";
import Footer from "../../components/Footer";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

const TeamGallery = React.lazy(() => import("./WebsiteSections/TeamGallery"));
const RegisterationForm = React.lazy(
  () => import("./WebsiteSections/RegistrationForm"),
);
const TeamRegistrationForm = React.lazy(
  () => import("./WebsiteSections/TeamRegistrationForm"),
);
const KeyFeatures = React.lazy(() => import("./WebsiteSections/KeyFeatures"));
const Sponsors = React.lazy(() => import("./WebsiteSections/Sponsors"));
const FAQ = React.lazy(() => import("./WebsiteSections/FAQ"));
const GuestGallery = React.lazy(() => import("./WebsiteSections/GuestGallery"));
const Rules = React.lazy(() => import("./WebsiteSections/Rules"));
const IndiaMap = React.lazy(() => import("./WebsiteSections/IndiaMap"));

const RegWebsite = () => {
  const [pageData, setPageData] = React.useState(null);
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [activeRegistrationForm, setActiveRegistrationForm] = React.useState("player");
  const [websiteThemeMode, setWebsiteThemeMode] = React.useState("light");
  const [hideHeaderFooter, setHideHeaderFooter] = React.useState(false);
  const { tournamentId, auctionId } = useParams();

  const showPlayerRegistration = !!pageData?.showRegistrationForm;
  const showTeamRegistration = !!pageData?.showTeamRegistration;
  const showRegistrationSwitcher = showPlayerRegistration && showTeamRegistration;
  const requestedRegistrationTab =
    new URLSearchParams(window.location.search).get("registration") || "";
  const resolvedAuctionId = pageData?.auctionId?._id || auctionId;
  const resolvedTournamentId = pageData?.tournamentId?._id || tournamentId;
  const teamRegistrationConfig = pageData?.auctionId?.teamRegistration || {};
  const activeTheme = {
    primary: "#2563eb",
    secondary: "#1d4ed8",
    accent: "#f59e0b",
    soft: "#eff6ff",
    dark: "#0f172a",
    hero: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)",
  };
  const themeStyle = {
    "--reg-primary": activeTheme.primary,
    "--reg-secondary": activeTheme.secondary,
    "--reg-accent": activeTheme.accent,
    "--reg-soft": activeTheme.soft,
    "--reg-dark": activeTheme.dark,
    "--reg-hero": activeTheme.hero,
    "--primary": activeTheme.primary,
    "--color-header-1": activeTheme.dark,
    "--color-header-2": activeTheme.primary,
    "--color-crickbroYellow": activeTheme.accent,
    "--color-text": websiteThemeMode === "dark" ? "#f8fafc" : activeTheme.dark,
  };

  

  useEffect(() => {
    if (requestedRegistrationTab === "team" && showTeamRegistration) {
      setActiveRegistrationForm("team");
      return;
    }

    if (requestedRegistrationTab === "player" && showPlayerRegistration) {
      setActiveRegistrationForm("player");
      return;
    }

    if (showPlayerRegistration && showTeamRegistration) {
      setActiveRegistrationForm((prev) =>
        prev === "player" || prev === "team" ? prev : "player",
      );
      return;
    }

    if (showTeamRegistration) {
      setActiveRegistrationForm("team");
    } else {
      setActiveRegistrationForm("player");
    }
  }, [requestedRegistrationTab, showPlayerRegistration, showTeamRegistration]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    const playerId = queryParams.get("playerId");
    const playertoken = queryParams.get("playertoken");

    if (playerId && playertoken) {
      localStorage.setItem("playerId", playerId);
      localStorage.setItem("token", playertoken);
      window.dispatchEvent(new Event("userLoggedIn"));
      window.dispatchEvent(new Event("crickbro-auth-change"));
      setHideHeaderFooter(true);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check if preview data exists in localStorage
      const previewData = localStorage.getItem("landingPagePreview");

      if (previewData) {
        // Use preview data and clear it
        const parsedPreviewData = JSON.parse(previewData);
        setPageData(parsedPreviewData);
        setIsPreviewMode(true);
        localStorage.removeItem("landingPagePreview"); // Clear after using
        console.log("Using preview data:", parsedPreviewData);
      } else {
        // Fetch from API
        const response = await api.get(
          `/webSiteApi/auctionLandingPage/auctionLandingPage?tournamentId=${tournamentId}&auctionId=${auctionId}`,
        );
        const data = response.data.data.landingPage;
        setPageData(data);
        setIsPreviewMode(false);
      }
    } catch (err) {
      console.error("Error fetching landing page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tournamentId, auctionId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading landing page...</p>
        </div>
      </div>
    );
  }

  // Show error if no data
  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-2">⚠️ No data available</p>
          <p className="text-gray-600">Unable to load landing page data</p>
        </div>
      </div>
    );
  }

 

  return (
    <div className="relative" data-theme={websiteThemeMode} style={themeStyle}>
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👁️</span>
              <div>
                <p className="font-bold text-lg">Preview Mode</p>
                <p className="text-sm text-white/90">
                  This is a preview of your landing page with unsaved changes
                </p>
              </div>
            </div>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
      <div className={isPreviewMode ? "mt-20" : ""}>
        {!hideHeaderFooter && (
          <Header
            data={pageData}
            theme={activeTheme}
            themeMode={websiteThemeMode}
            onThemeModeChange={setWebsiteThemeMode}
          />
        )}
        {pageData?.sliderImages && <Slider pagedata={pageData} />}
        <React.Suspense
          fallback={
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          }
        >
        {activeRegistrationForm === "team" && showTeamRegistration ? (
          <TeamRegistrationForm
            auctionId={resolvedAuctionId}
            tournamentId={resolvedTournamentId}
            teamRegistration={teamRegistrationConfig}
            auctionName={pageData?.auctionId?.auctionName}
            pagedata={pageData}
            theme={activeTheme}
            themeMode={websiteThemeMode}
            showSwitcher={showRegistrationSwitcher}
            activeTab={activeRegistrationForm}
            onSwitch={setActiveRegistrationForm}
          />
        ) : (
          showPlayerRegistration && (
            <RegisterationForm
              pagedata={pageData}
              theme={activeTheme}
              themeMode={websiteThemeMode}
              showSwitcher={showRegistrationSwitcher}
              activeTab={activeRegistrationForm}
              onSwitch={setActiveRegistrationForm}
            />
          )
        )}
        {pageData?.rules?.items.length > 0 && <Rules pagedata={pageData} />}
        {pageData?.keyFeatures?.features?.length > 0 && (
          <KeyFeatures
            pagedata={pageData}
            theme={activeTheme}
            themeMode={websiteThemeMode}
          />
        )}
        {/* <Sponsors pagedata={pageData}/> */}

        {pageData?.cardImages && pageData?.cardImages?.Images?.length > 0 && <GuestGallery pagedata={pageData} />}
        {pageData?.sponsors && pageData?.sponsors.length > 0 && <Sponsors pagedata={pageData} />}

        {pageData?.galleryImages.length > 0 && <TeamGallery pagedata={pageData} />}
        {pageData?.showTrialLocations && <IndiaMap pagedata={pageData} />}

        {pageData?.questionsAnswers && pageData?.questionsAnswers.length > 0 && <FAQ pagedata={pageData} />}

        {!hideHeaderFooter && <Footer isDarkTheme={true} />}
        </React.Suspense>
      </div>
    </div>
  );
};

export default RegWebsite;
