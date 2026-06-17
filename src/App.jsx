import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { ContentProvider } from "./context/ContentProvider";
import { useLoginPopup } from "./context/LoginPopupContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const HotAuctions = lazy(() => import("./components/Home/HotAuctions"));
const TabsNavigation = lazy(
  () => import("./pages/AuctionManagement/TabsNavigation"),
);
const LoginPopup = lazy(() => import("./components/LoginPopup"));
const Enquiries = lazy(() => import("./pages/Enquiries"));
const CreateEditAuction = lazy(() => import("./pages/CreateEditAuction"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const AdminAuctionControl = lazy(
  () =>
    import("./pages/AuctionManagement/AdminControl/ManageAuction/AuctionBiddingPanel/AdminAuctionControl"),
);
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const AuctionDetailsForUser = lazy(
  () => import("./pages/AuctionDetailsForPublic/AuctionDetailsForUser"),
);
const RegWebsite = lazy(
  () => import("./pages/ViewRegistrationWebiste/RegWebsite"),
);
const LiveAuctionForAudience = lazy(
  () => import("./pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/LiveAuctionForAudience"),
);
const AuctionPlayerOverlay = lazy(
  () => import("./pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/AuctionPlayerOverlay"),
);
const AuctionPlayerOverlayV2 = lazy(
  () => import("./pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/AuctionPlayerOverlayV2"),
);
const AuctionPlayerOverlayV3 = lazy(
  () => import("./pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/AuctionPlayerOverlayV3"),
);
const TeamsOverlay = lazy(
  () => import("./pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/TeamsOverlay"),
);
const AuctionSplitOverlay = lazy(
  () => import("./pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/AuctionSplitOverlay"),
);
const AuctionBroadcastBoardOverlay = lazy(
  () =>
    import(
      "./pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/AuctionBroadcastBoardOverlay"
    ),
);

const TeamBidding=lazy(
  () => import("./pages/AuctionManagement/TeamOwnerTabs/TeamBiddingPanel")
)

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--bg-main)]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-primary)] border-t-[var(--primary)]" />
  </div>
);

function AppContent({ theme, toggleTheme }) {
  return (
    <ContentProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={<Home theme={theme} onToggleTheme={toggleTheme} />}
          />
          <Route
            exact
            path="/auction"
            element={<HotAuctions theme={theme} onToggleTheme={toggleTheme} />}
          />

          <Route
            exact
            path="/privacy-policy"
            element={
              <PrivacyPolicy theme={theme} onToggleTheme={toggleTheme} />
            }
          />

          <Route
            exact
            path="/terms-of-service"
            element={
              <TermsOfService theme={theme} onToggleTheme={toggleTheme} />
            }
          />

          <Route
            exact
            path="/auction-details/:auctionId"
            element={
              <ProtectedRoute>
                <TabsNavigation theme={theme} onToggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/enquiries"
            element={<Enquiries theme={theme} onToggleTheme={toggleTheme} />}
          />
          <Route
            exact
            path="/enquiries/manage"
            element={
              <ProtectedRoute>
                <Enquiries theme={theme} onToggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/createAuction"
            element={
              <ProtectedRoute>
                <CreateEditAuction theme={theme} onToggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/editAuction/:auctionId"
            element={
              <ProtectedRoute requireAuctionAdmin>
                <CreateEditAuction theme={theme} onToggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/about"
            element={<AboutUs theme={theme} onToggleTheme={toggleTheme} />}
          />
          <Route
            exact
            path="/myProfile"
            element={
              <ProtectedRoute>
                <MyProfile theme={theme} onToggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/live-auction/:auctionId"
            element={
              <ProtectedRoute requireAuctionAdmin>
                <AdminAuctionControl />
              </ProtectedRoute>
            }
          />

          {/* Overlay screen routes */}
         <Route
            exact
            path="/live-auction-audience/:auctionId"
            element={<LiveAuctionForAudience />}
          />
          <Route
            exact
            path="/auction-overlay-v1/:auctionId"
            element={<AuctionPlayerOverlay />}
          />
          <Route
            exact
            path="/auction-overlay-v2/:auctionId"
            element={<AuctionPlayerOverlayV2 />}
          />
          <Route
            exact
            path="/auction-overlay-v3/:auctionId"
            element={<AuctionPlayerOverlayV3 />}
          />
          <Route
            exact
            path="/teams-overlay/:auctionId"
            element={<TeamsOverlay />}
          />
          <Route
            exact
            path="/auction-split-overlay/:auctionId"
            element={<AuctionSplitOverlay />}
          />
          <Route
            exact
            path="/auction-broadcast-board/:auctionId"
            element={<AuctionBroadcastBoardOverlay />}
            />

          <Route
            path="howItWorks"
            element={<HowItWorks theme={theme} onToggleTheme={toggleTheme} />}
          />
          <Route
            exact
            path="/viewAuction/:auctionId"
            element={
              <AuctionDetailsForUser
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            }
          />
          <Route
            exact
            path="/viewlanding-page/:tournamentId/:auctionId"
            element={<RegWebsite />}
          />

            <Route
            exact
            path="/team-bidding/:auctionId"
            element={<TeamBidding />}
          />
        </Routes>
      </Suspense>
    </ContentProvider>
  );
}

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { loginPopupOpen, closeLoginPopup } = useLoginPopup();
  const [theme, setTheme] = useState("dark");
  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  useEffect(() => {
    const handleOpenLogin = () => {
      setShowLogin(true);
    };

    window.addEventListener("openLoginPopup", handleOpenLogin);

    return () => {
      window.removeEventListener("openLoginPopup", handleOpenLogin);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent">
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
        {(showLogin || loginPopupOpen) && (
          <Suspense fallback={null}>
            <LoginPopup
              onClose={() => {
                setShowLogin(false);
                closeLoginPopup();
              }}
            />
          </Suspense>
        )}
        <AppContent theme={theme} toggleTheme={toggleTheme} />
      </div>
    </BrowserRouter>
  );
};

export default App;
