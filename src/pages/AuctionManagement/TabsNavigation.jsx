import React, { lazy, Suspense, useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Info,
  Gavel,
  Users,
  Shield,
  BarChart3,
  UserCircle,
  Trophy,
  UserCheck,
  FlaskConical,
  CalendarClock,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
  PanelsTopLeft,
  LayoutDashboard,
  Link,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Crown,
  UsersRound,
  CalendarDays,
  Wrench,
  Eye,
  Briefcase,
  FileText,
  Link2,
} from "lucide-react";

// TAB CONTENT COMPONENTS
const TournamentDetails = lazy(() => import("./AdminControl/TournamentInfo.jsx"));
// import DetailsOfAuction from "../../pages/AuctionDetailsTabs/DetailsOfAuction";
// import AuctionPlayers from "../../pages/AuctionDetailsTabs/AuctionPlayers";
// import AuctionTeams from "../../pages/AuctionDetailsTabs/AuctionTeams";
// import SettingsTab from "../../pages/AuctionDetailsTabs/SettingsTab";
const Slot = lazy(
  () => import("./AdminControl/Trials&Selection/SlotAndSession/Slot.jsx"),
);
// import Categories from "../../pages/AuctionDetailsTabs/CategoryTab/Categories";
const CreateWebsite = lazy(
  () =>
    import(
      "../../pages/AuctionManagement/AdminControl/RegistrationWebsite/CreateWebiste.jsx"
    ),
);
import {
  EnrollPlayer,
  fetchAuctionDetails,
  fetchUserRole,
} from "../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
// import TrialSlot from "../../pages/AuctionDetailsTabs/TrialSlotTab/TrialSlot";
import { toast } from "react-toastify";
import Links from "../../pages/AuctionManagement/AdminControl/ManageAuction/OverlayLinks/Links.jsx";
const TeamsTab = lazy(
  () =>
    import(
      "../../pages/AuctionManagement/AdminControl/ManageAuction/ManageTeams/TeamsTab.jsx"
    ),
);
// import OwnerTeamDetails from "./Live_Auction/TeamOwner/OwnerTeamDetails";
// import SelectorPlayerCard from "../../pages/AuctionDetailsTabs/AssignedPlayersTab/SelectorPlayerCard";
// import AssignedPlayersToSelector from "../../pages/AuctionDetailsTabs/AssignedPlayersTab/AssignedPlayersToSelector";
const AuctionOverview = lazy(
  () =>
    import(
      "../../pages/AuctionManagement/AdminControl/ManageAuction/AuctionOverview.jsx"
    ),
);
const Dashboard = lazy(
  () => import("../../pages/AuctionManagement/AdminControl/Dashboard"),
);

const RegistrationOverview = lazy(
  () =>
    import(
      "../../pages/AuctionManagement/AdminControl/RegistrationOverview.jsx"
    ),
);
const DirectSelect = lazy(
  () =>
    import(
      "../../pages/AuctionManagement/SelectorsTab/DirectSelect/SelectDirect.jsx"
    ),
);
// import AdminPanel from "./AuctionDetailsTabs/AdminPanel";
const TrialSettings = lazy(
  () =>
    import("./AdminControl/Trials&Selection/TrialSettings/TrialSettings.jsx"),
);
const AuctionSettings = lazy(
  () => import("./AdminControl/ManageAuction/Settings/AuctionSettings.jsx"),
);
const SelectorSlots = lazy(
  () =>
    import("../../pages/AuctionManagement/SelectorsTab/TrailsSlot/SelectorSlots.jsx"),
);
const PlayersAssignedToSelector = lazy(
  () => import("./SelectorsTab/AssignedPlayers/PlayerAssignedToSelector.jsx"),
);
const TeamDetails = lazy(() => import("./TeamOwnerTabs/TeamDetails.jsx"));
const AllPlayers = lazy(() => import("./AdminControl/AllPlayers/AllPlayers.jsx"));
const ManagePlayers = lazy(
  () => import("./AdminControl/ManageAuction/PlayersTabs/ManagePlayers.jsx"),
);
const ManagePlayerTabs = lazy(
  () =>
    import("./AdminControl/Trials&Selection/TrailsPlayersTabs/ManagePlayerTabs.jsx"),
);

const AdminAuctionControl= lazy(
  () =>
    import("./AdminControl/ManageAuction/AuctionBiddingPanel/AdminAuctionControl.jsx"),
);



/* ===============================
   ROLE PRIORITY ORDER (Highest to Lowest)
================================ */
const ROLE_PRIORITY = ["admin", "selector", "teamOwner", "player"];

/* ===============================
   ROLE → ALLOWED TABS (with nested structure)
================================ */
const roleTabs = {
  admin: [
    "info",   
    "dashboard",
    "registrationOverview",
    "createWebsite",
    "trialsAndSelection",
    "manageAuction",
    "allPlayers",
    "trialSettings",
    "auctionSettings",
    "auctionOverview",
    "manageTeams",
    "categories",
    "overlayLinks",
  ],
  selector: ["info", "assignedPlayers", "trialslot", "directSelect","selectorTabs"],
  teamOwner: ["info", "myteam"],
  player: ["info"],
  newPlayer: ["info"],
};

/* ===============================
   NESTED TAB STRUCTURE
================================ */
const tabStructure = [
  {
    key: "info",
    label: "Tournament Info",
    icon: Info,
    subTabs: [],
  },

  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    subTabs: [],
  },
  {
    key: "registrationOverview",
    label: "Registration Overview",
    icon: FileText,
    subTabs: [],
  },
   {
    key: "allPlayers",
    label: "All Players",
    icon: Users,
    subTabs: [],
  },
  {
    key: "players",
    label: "Players",
    icon: Users,
    subTabs: [],
  },
  {
    key: "createWebsite",
    label: "Create Registration Website",
    icon: PanelsTopLeft,
    subTabs: [],
  },
  {
    key: "trialsAndSelection",
    label: "Trials and Selection",
    icon: FlaskConical,
    subTabs: [
      { key: "slot", label: "Slot and Session", icon: CalendarDays },
      { key: "trialSettings", label: "Trial Settings", icon: Wrench },
      { key: "trialPlayers", label: "Trial Players", icon: Users },
    ],
  },
  {
    key: "manageAuction",
    label: "Manage Auction",
    icon: Gavel,
    subTabs: [
      //   { key: "adminPanel", label: "Admin Panel", icon: Crown },
      { key: "auctionSettings", label: "Auction Settings", icon: Settings },
      { key: "auctionOverview", label: "Auction Overview", icon: Eye },
      { key: "manageTeams", label: "Manage Teams", icon: UsersRound },
      { key: "players", label: "Manage Players", icon: Users },
      { key: "overlayLinks", label: "Live Links", icon: Link2},
      { key: "biddingPanel", label: "Auction Room", icon: Gavel },
    ],
  },
  {
    key: "selectorTabs",
    label: "Selector Tabs",
    icon: Shield,
    subTabs: [
      { key: "trialSlot", label: "Trial Slot", icon: CalendarClock },
      { key: "assignedPlayers", label: "Assigned Players", icon: UserCheck },
      { key: "directSelect", label: "Direct Select", icon: CheckSquare },
    ],
  },
   {
    key: "myteam",
    label: "My Team",
    icon: Briefcase,
    subTabs: [],
  },
];

/* ===============================  
   MAIN COMPONENT
================================ */
const AuctionDetails = ({ theme, onToggleTheme }) => {
  const { auctionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    trialsAndSelection: false,
    manageAuction: false,
  });
  const playerId = localStorage.getItem("playerId");
  const userRole = useSelector((state) => state.data?.userRole);
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "dashboard",
  );
  const [activeSubTab, setActiveSubTab] = useState(
    () => searchParams.get("subTab") || null,
  );
  const [visitedTabs, setVisitedTabs] = useState(() => new Set());
  const tournamentId = useSelector((state) => state.tournamentId);
  const isTrialType = useSelector(
    (state) => state?.data?.auctionDetails?.trailTypeAuction,
  );

  // Check if user is logged in, if not redirect to /auction
  useEffect(() => {
    if (!playerId) {
      navigate("/auction");
    }
  }, [playerId, navigate]);

  useEffect(() => {
    dispatch(fetchUserRole(auctionId, playerId));
    dispatch(fetchAuctionDetails(auctionId));
  }, [auctionId, playerId]);

  const getAllAllowedTabs = (roles) => {
    const allTabsSet = new Set();
    roles.forEach((role) => {
      const tabsForRole = roleTabs[role] || [];
      tabsForRole.forEach((tab) => allTabsSet.add(tab));
    });
    return Array.from(allTabsSet);
  };

  const userRoles = useMemo(() => {
    if (!userRole) return ["newPlayer"];
    const roles = [];
    if (userRole.admin === true) roles.push("admin");
    if (userRole.selector === true) roles.push("selector");
    if (userRole.teamOwner === true) roles.push("teamOwner");
    if (userRole.auctionPlayer === true) roles.push("player");
    if (roles.length === 0) roles.push("newPlayer");
    return roles;
  }, [userRole]);

  const allowedParentTabKeys = useMemo(() => {
    return getAllAllowedTabs(userRoles);
  }, [userRoles]);

  // Filter visible tabs based on role
  const visibleTabs = useMemo(() => {
    return tabStructure.filter((tab) => allowedParentTabKeys.includes(tab.key));
  }, [allowedParentTabKeys]);

  // Check if a subTab is allowed for the current role
  const isSubTabAllowed = (parentKey, subTabKey) => {
    // For admin role, all subTabs are allowed
    if (userRoles.includes("admin")) return true;

    // For other roles, check against legacy roleTabs
    const allowedLegacyTabs = getAllAllowedTabs(userRoles);
    return allowedLegacyTabs.includes(subTabKey);
  };

  // Filter subTabs based on role
  const getFilteredSubTabs = (parentTab) => {
    if (!parentTab.subTabs || parentTab.subTabs.length === 0) return [];
    return parentTab.subTabs.filter((subTab) =>
      isSubTabAllowed(parentTab.key, subTab.key),
    );
  };

  // Set default active tab when roles load
  useEffect(() => {
    if (!userRole) return;
    if (visibleTabs.length === 0) return;

    const activeParent = visibleTabs.find((tab) => tab.key === activeTab);
    if (activeParent) return;

    const firstTab = visibleTabs[0];
    const filteredSubTabs = getFilteredSubTabs(firstTab);
    setActiveTab(firstTab.key);
    setActiveSubTab(filteredSubTabs[0]?.key || null);
  }, [activeTab, visibleTabs, userRoles]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  /* ===============================
     TAB CONTENT RENDER
  ================================ */
  const currentParentTab = visibleTabs.find((tab) => tab.key === activeTab);
  const currentSubTab = currentParentTab?.subTabs?.find(
    (sub) => sub.key === activeSubTab,
  );
  const effectiveTab = currentSubTab
    ? currentSubTab.key
    : currentParentTab
      ? activeTab
      : null;

  useEffect(() => {
    if (!effectiveTab) return;

    setSearchParams(
      (previousParams) => {
        const nextParams = new URLSearchParams(previousParams);
        nextParams.set("tab", activeTab);

        if (activeSubTab) {
          nextParams.set("subTab", activeSubTab);
        } else {
          nextParams.delete("subTab");
        }

        return nextParams;
      },
      { replace: true },
    );
  }, [activeTab, activeSubTab, effectiveTab, setSearchParams]);

  useEffect(() => {
    if (!effectiveTab) return;
    setVisitedTabs((previousTabs) => {
      if (previousTabs.has(effectiveTab)) return previousTabs;
      const nextTabs = new Set(previousTabs);
      nextTabs.add(effectiveTab);
      return nextTabs;
    });
  }, [effectiveTab]);

  const renderTab = (tabKey) => {
    // Legacy tabs for backward compatibility
    switch (tabKey) {
      case "dashboard":
        return <Dashboard auctionId={auctionId} />;

      case "registrationOverview":
        return <RegistrationOverview auctionId={auctionId} />;

      case "createWebsite":
        return (
          <CreateWebsite
            tournamentId={tournamentId}
            auctionId={auctionId}
            TrialType={isTrialType}
          />
        );

      case "allPlayers":
        return <AllPlayers auctionId={auctionId} />;

      case "players":
        return <ManagePlayers auctionId={auctionId} />;

      case "slot":
        return <Slot auctionId={auctionId} />;

      case "trialSettings":
        return <TrialSettings auctionId={auctionId} />;

      case "trialPlayers":
        return <ManagePlayerTabs auctionId={auctionId} />;  

      case "assignedPlayers":
        return <PlayersAssignedToSelector auctionId={auctionId} />;

      case "directSelect":
        return <DirectSelect auctionId={auctionId} />;

      case "auctionSettings":
        return <AuctionSettings auctionId={auctionId} />;

      case "auctionOverview":
        return <AuctionOverview auctionId={auctionId} />;

      case "manageTeams":
        return <TeamsTab auctionId={auctionId} />;

      case "myteam":
        return <TeamDetails auctionId={auctionId} playerId={playerId} />;  

      case "overlayLinks":
        return <Links auctionId={auctionId} />;

      case "biddingPanel":
        return <AdminAuctionControl auctionId={auctionId} />; 
      case "info":
        return <TournamentDetails auctionId={auctionId} />;

      case "trialSlot":
        return <SelectorSlots auctionId={auctionId} />;

       default:
        return null;
    }
  };

  // Show loading state while fetching roles
  if (!userRole) {
    return (
      <>
        <Header theme={theme} onToggleTheme={onToggleTheme} />
        <main className="auction-management-theme relative min-h-[calc(100vh-76px)]">
          <div className="relative z-10 flex min-h-[calc(100vh-76px)] items-center justify-center">
            <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-6 py-4 text-sm font-bold text-[var(--primary)] shadow-[var(--shadow-glow)]">
              Loading auction details...
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main className="auction-management-theme relative min-h-[calc(100vh-76px)] overflow-visible bg-[var(--bg-main)] p-4 text-[var(--text-primary)] max-md:min-h-[calc(100vh-68px)] max-md:p-3">
        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden absolute top-3 left-3 z-20">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg bg-[var(--secondary)] p-2 text-[var(--text-dark)] shadow-md transition hover:bg-[var(--secondary-strong)]"
            title="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 z-50 h-full w-72 overflow-y-auto rounded-r-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 pb-6 text-[var(--text-primary)] shadow-lg scrollbar-hide md:hidden">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm font-bold text-[var(--text-dark)] shadow transition hover:bg-[var(--secondary-strong)]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-sm font-medium">Close</span>
              </button>

              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const filteredSubTabs = getFilteredSubTabs(tab);
                const isExpanded = expandedMenus[tab.key];
                const isParentActive = activeTab === tab.key;

                return (
                  <div key={tab.key} className="mb-2">
                    <div
                      onClick={() => {
                        if (filteredSubTabs.length > 0) {
                          toggleMenu(tab.key);
                          setActiveTab(tab.key);
                          if (!isExpanded && filteredSubTabs.length > 0) {
                            setActiveSubTab(filteredSubTabs[0].key);
                          }
                        } else {
                          setActiveTab(tab.key);
                          setActiveSubTab(null);
                          setMobileMenuOpen(false);
                        }
                      }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
                        isParentActive
                          ? "bg-[var(--secondary)] text-[var(--text-dark)] shadow-md"
                          : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-2 h-2 text-xs flex-shrink-0" />
                        <span>{tab.label}</span>
                      </div>
                      {filteredSubTabs.length > 0 && (
                        <>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </div>

                    {filteredSubTabs.length > 0 && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1 border-[var(--secondary-light)] pl-3">
                        {filteredSubTabs.map((subTab) => {
                          const SubIcon = subTab.icon;
                          const isSubActive =
                            activeSubTab === subTab.key &&
                            activeTab === tab.key;
                          return (
                            <div
                              key={subTab.key}
                              onClick={() => {
                                setActiveTab(tab.key);
                                setActiveSubTab(subTab.key);
                                setMobileMenuOpen(false);
                              }}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                                isSubActive
                                  ? "bg-[var(--secondary)] text-[var(--text-dark)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                              }`}
                            >
                              <SubIcon className="w-3 h-3" />
                              <span>{subTab.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="relative z-10 min-h-[calc(100vh-108px)]">
          {/* SIDEBAR */}
          <aside
            className={`hidden md:block transition-all duration-300 ${
              sidebarCollapsed ? "w-16" : "w-64"
            }`}
          >
            <div
              className={`fixed left-4 top-[92px] bottom-4 flex flex-col overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-card)] transition-all duration-300 ${
                sidebarCollapsed ? "w-16" : "w-64"
              }`}
            >
              <div className="border-b border-[var(--border-card)] p-3">
                {/* {!sidebarCollapsed && (
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold leading-4 text-[var(--text-primary)]">
                        Auction Manager
                      </p>
                      <p className="truncate text-[11px] font-medium leading-4 text-[var(--text-secondary)]">
                        Control panel
                      </p>
                    </div>
                  </div>
                )} */}
              {/* Toggle Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)] md:flex"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
                {!sidebarCollapsed && (
                  <span className="text-xs font-medium">Collapse</span>
                )}
              </button>
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pr-2">
                {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isParentActive = activeTab === tab.key;
                const filteredSubTabs = getFilteredSubTabs(tab);
                const isExpanded = expandedMenus[tab.key];

                if (sidebarCollapsed) {
                  // Collapsed view - icons only
                  return (
                    <div key={tab.key} className="group relative mb-2">
                      <div
                        onClick={() => {
                          if (filteredSubTabs.length > 0) {
                            toggleMenu(tab.key);
                            setActiveTab(tab.key);
                          } else {
                            setActiveTab(tab.key);
                            setActiveSubTab(null);
                          }
                        }}
                        className={`w-full flex items-center justify-center rounded-lg border px-2 py-3 transition cursor-pointer ${
                          isParentActive
                            ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)] shadow-sm"
                            : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-card)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--primary)]"
                        }`}
                        title={tab.label}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {/* Tooltip for collapsed mode */}
                      <div className="absolute left-full ml-2 top-1/2 z-50 -translate-y-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition pointer-events-none whitespace-nowrap group-hover:opacity-100">
                        {tab.label}
                      </div>
                    </div>
                  );
                }

                // Expanded view
                return (
                  <div key={tab.key} className="mb-2">
                    <div
                      onClick={() => {
                        if (filteredSubTabs.length > 0) {
                          toggleMenu(tab.key);
                          setActiveTab(tab.key);
                          if (!isExpanded && filteredSubTabs.length > 0) {
                            setActiveSubTab(filteredSubTabs[0].key);
                          }
                        } else {
                          setActiveTab(tab.key);
                          setActiveSubTab(null);
                        }
                      }}
                      className={`relative w-full flex items-center justify-between gap-2.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                        isParentActive
                          ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)] shadow-sm"
                          : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-card)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--primary)]"
                      }`}
                    >
                      {isParentActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--secondary)]" />
                      )}
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            isParentActive
                              ? "bg-[var(--secondary)] text-[#102033]"
                              : "bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {filteredSubTabs.length > 0 && (
                        <>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </>
                      )}
                    </div>

                    {filteredSubTabs.length > 0 && isExpanded && (
                      <div className="ml-3 mt-1 space-y-1 border-l border-[var(--border-card)] pl-3">
                        {filteredSubTabs.map((subTab) => {
                          const SubIcon = subTab.icon;
                          const isSubActive =
                            activeSubTab === subTab.key &&
                            activeTab === tab.key;
                          return (
                            <div
                              key={subTab.key}
                              onClick={() => {
                                setActiveTab(tab.key);
                                setActiveSubTab(subTab.key);
                              }}
                              className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition cursor-pointer ${
                                isSubActive
                                  ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"
                                  : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-card)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--primary)]"
                              }`}
                            >
                              {isSubActive && (
                                <span className="absolute left-0 top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--secondary)]" />
                              )}
                              <SubIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{subTab.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </nav>
            </div>
          </aside>

          {/* CONTENT */}
          <section
            className={`min-h-0 transition-all duration-300 md:fixed md:bottom-4 md:right-4 md:top-[92px] ${
              sidebarCollapsed ? "md:left-20" : "md:left-72"
            }`}
          >
            <div className="min-h-[calc(100vh-108px)] overflow-visible rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-card)] scrollbar-hide md:h-full md:min-h-0 md:overflow-y-auto">
              <Suspense
                fallback={
                  <div className="flex min-h-[320px] items-center justify-center">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--border-primary)] border-t-[var(--primary)]" />
                  </div>
                }
              >
                {[...visitedTabs].map((tabKey) => (
                  <div
                    key={tabKey}
                    className={tabKey === effectiveTab ? "block" : "hidden"}
                  >
                    {renderTab(tabKey)}
                  </div>
                ))}
              </Suspense>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AuctionDetails;
