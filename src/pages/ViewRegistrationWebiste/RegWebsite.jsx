import React, { useEffect } from "react";
import TeamGallery from "./WebsiteSections/TeamGallery";
import Header from "./WebsiteSections/Header";
import Slider from "./WebsiteSections/Slider";
import RegisterationForm from "./WebsiteSections/RegistrationForm";
import TeamRegistrationForm from "./WebsiteSections/TeamRegistrationForm";
import KeyFeatures from "./WebsiteSections/KeyFeatures";
import Sponsors from "./WebsiteSections/Sponsors";
import FAQ from "./WebsiteSections/FAQ";
import GuestGallery from "./WebsiteSections/GuestGallery";
import Rules from "./WebsiteSections/Rules";
import Footer from "../../components/Footer";
// import Header from "../../components/LandingHeader";
import IndiaVenueMap from "../../components/IndiaVenueMap";
// import axios from "axios";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import IndiaMap from "./WebsiteSections/IndiaMap";

const RegWebsite = () => {
  const [pageData, setPageData] = React.useState(null);
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [activeRegistrationForm, setActiveRegistrationForm] = React.useState("player");
  const { tournamentId, auctionId } = useParams();

  const showPlayerRegistration = !!pageData?.showRegistrationForm;
  const showTeamRegistration = !!pageData?.showTeamRegistration;
  const showRegistrationSwitcher = showPlayerRegistration && showTeamRegistration;
  const resolvedAuctionId = pageData?.auctionId?._id || auctionId;
  const resolvedTournamentId = pageData?.tournamentId?._id || tournamentId;
  const teamRegistrationConfig = pageData?.auctionId?.teamRegistration || {};

  console.log("page", pageData);

  useEffect(() => {
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
  }, [showPlayerRegistration, showTeamRegistration]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    const playerId = queryParams.get("playerId");
    const playertoken = queryParams.get("playertoken");

    if (playerId && playertoken) {
      localStorage.setItem("playerId", playerId);
      localStorage.setItem("token", playertoken);
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

  // console.log(pageData, "page");

  return (
    <div className="relative">
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
        <Header data={pageData} />
        {pageData?.sliderImages && <Slider pagedata={pageData} />}
        {activeRegistrationForm === "team" && showTeamRegistration ? (
          <TeamRegistrationFormInline
            auctionId={resolvedAuctionId}
            tournamentId={resolvedTournamentId}
            teamRegistration={teamRegistrationConfig}
            auctionName={pageData?.auctionId?.auctionName}
            pagedata={pageData}
            showSwitcher={showRegistrationSwitcher}
            activeTab={activeRegistrationForm}
            onSwitch={setActiveRegistrationForm}
          />
        ) : (
          showPlayerRegistration && (
            <RegisterationForm
              pagedata={pageData}
              showSwitcher={showRegistrationSwitcher}
              activeTab={activeRegistrationForm}
              onSwitch={setActiveRegistrationForm}
            />
          )
        )}
        <Rules pagedata={pageData} />
        {pageData?.keyFeatures?.features?.length > 0 && <KeyFeatures pagedata={pageData} />}
        {/* <Sponsors pagedata={pageData}/> */}

        <GuestGallery pagedata={pageData} />
        {pageData?.sponsors && pageData?.sponsors.length > 0 && <Sponsors pagedata={pageData} />}

        {pageData?.galleryImages.length > 0 && <TeamGallery pagedata={pageData} />}
        {pageData?.showTrialLocations && <IndiaMap pagedata={pageData} />}

        {pageData?.questionsAnswers && pageData?.questionsAnswers.length > 0 && <FAQ pagedata={pageData} />}

        <Footer />
      </div>
    </div>
  );
};

export default RegWebsite;
