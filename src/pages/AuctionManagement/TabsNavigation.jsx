import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";

// TAB CONTENT COMPONENTS
import TournamentDetails from "./AdminControl/TournamentInfo.jsx";
// import DetailsOfAuction from "../../pages/AuctionDetailsTabs/DetailsOfAuction";
// import AuctionPlayers from "../../pages/AuctionDetailsTabs/AuctionPlayers";
// import AuctionTeams from "../../pages/AuctionDetailsTabs/AuctionTeams";
// import SettingsTab from "../../pages/AuctionDetailsTabs/SettingsTab";
import Slot from "./AdminControl/Trials&Selection/SlotAndSession/Slot.jsx";
// import Categories from "../../pages/AuctionDetailsTabs/CategoryTab/Categories";
import CreateWebsite from "../../pages/AuctionManagement/AdminControl/RegistrationWebsite/CreateWebiste.jsx";
import {
  EnrollPlayer,
  fetchAuctionDetails,
  fetchUserRole,
} from "../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
// import TrialSlot from "../../pages/AuctionDetailsTabs/TrialSlotTab/TrialSlot";
import { toast } from "react-toastify";
import TeamsTab from "../../pages/AuctionManagement/AdminControl/ManageAuction/ManageTeams/TeamsTab.jsx";
// import OwnerTeamDetails from "./Live_Auction/TeamOwner/OwnerTeamDetails";
// import SelectorPlayerCard from "../../pages/AuctionDetailsTabs/AssignedPlayersTab/SelectorPlayerCard";
// import AssignedPlayersToSelector from "../../pages/AuctionDetailsTabs/AssignedPlayersTab/AssignedPlayersToSelector";
import AuctionOverview from "../../pages/AuctionManagement/AdminControl/ManageAuction/AuctionOverview.jsx";
import Dashboard from "../../pages/AuctionManagement/AdminControl/Dashboard";
import Links from "./AdminControl/LiveLinks/Links.jsx";
import RegistrationOverview from "../../pages/AuctionManagement/AdminControl/RegistrationOverview.jsx";
import DirectSelect from "../../pages/AuctionManagement/SelectorsTab/DirectSelect/SelectDirect.jsx";
// import AdminPanel from "./AuctionDetailsTabs/AdminPanel";
import TrialSettings from "./AdminControl/Trials&Selection/TrialSettings/TrialSettings.jsx";
import AuctionSettings from "./AdminControl/ManageAuction/Settings/AuctionSettings.jsx";
import SelectorSlots from "../../pages/AuctionManagement/SelectorsTab/TrailsSlot/SelectorSlots.jsx";
import PlayersAssignedToSelector from "./SelectorsTab/AssignedPlayers/PlayerAssignedToSelector.jsx";
import TeamDetails from "./TeamOwnerTabs/TeamDetails.jsx";
import AllPlayers from "./AdminControl/AllPlayers/AllPlayers.jsx";
import ManagePlayers from "./AdminControl/ManageAuction/PlayersTabs/ManagePlayers.jsx";
import ManagePlayerTabs from "./AdminControl/Trials&Selection/TrailsPlayersTabs/ManagePlayerTabs.jsx";

/* ===============================
   ROLE PRIORITY ORDER (Highest to Lowest)
================================ */
const ROLE_PRIORITY = ["admin", "selector", "teamOwner", "player"];

/* ===============================
   ROLE → ALLOWED TABS (with nested structure)
================================ */
const roleTabs = {
  admin: [
    "dashboard",
    "registrationOverview",
    "createWebsite",
    "trialsAndSelection",
    "manageAuction",
    "allPlayers",
    // "players",
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    trialsAndSelection: false,
    manageAuction: false,
  });
  const playerId = localStorage.getItem("playerId");
  const userRole = useSelector((state) => state.data?.userRole);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState(null);
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
    if (visibleTabs.length > 0) {
      const firstTab = visibleTabs[0];
      setActiveTab(firstTab.key);

      // Set default subTab if available
      const filteredSubTabs = getFilteredSubTabs(firstTab);
      if (filteredSubTabs.length > 0) {
        setActiveSubTab(filteredSubTabs[0].key);
      } else {
        setActiveSubTab(null);
      }
    }
  }, [visibleTabs, userRoles]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  /* ===============================
     TAB CONTENT RENDER
  ================================ */
  const renderTab = () => {
    // Check if the current active tab is a parent or subTab
    const currentParentTab = visibleTabs.find((tab) => tab.key === activeTab);
    const currentSubTab = currentParentTab?.subTabs?.find(
      (sub) => sub.key === activeSubTab,
    );

    // Determine which content to show
    const effectiveTab = currentSubTab ? currentSubTab.key : activeTab;

    // Legacy tabs for backward compatibility
    switch (effectiveTab) {
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
      <main className="auction-management-theme auction-management-shell relative min-h-[calc(100vh-76px)] overflow-visible p-4 max-md:min-h-[calc(100vh-68px)] max-md:p-3">
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
            <div className="auction-sidebar-panel md:hidden fixed left-0 top-0 h-full w-72 overflow-y-auto p-3 rounded-r-xl shadow-lg z-50 scrollbar-hide pb-6">
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
                      <div className="ml-6 mt-1 space-y-1  border-[var(--secondary-light)] pl-3">
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

        <div className="relative z-10 grid min-h-[calc(100vh-108px)] grid-cols-12 gap-4">
          {/* SIDEBAR */}
          <aside
            className={`hidden md:block col-span-12 transition-all duration-300 ${
              sidebarCollapsed ? "md:col-span-1" : "md:col-span-2"
            }`}
          >
            <div className="auction-sidebar-panel sticky top-4 max-h-[calc(100vh-108px)] overflow-y-auto p-3 pb-6 scrollbar-hide">
              {/* Toggle Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mb-3 hidden w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 py-2 text-[var(--primary)] shadow transition hover:bg-[var(--secondary)] hover:text-[var(--text-dark)] md:flex"
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

              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isParentActive = activeTab === tab.key;
                const filteredSubTabs = getFilteredSubTabs(tab);
                const isExpanded = expandedMenus[tab.key];

                if (sidebarCollapsed) {
                  // Collapsed view - icons only
                  return (
                    <div key={tab.key} className="relative group">
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
                        className={`w-full flex items-center justify-center px-2 py-3 rounded-lg transition cursor-pointer ${
                          isParentActive
                            ? "auction-nav-active"
                            : "auction-nav-idle"
                        }`}
                        title={tab.label}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {/* Tooltip for collapsed mode */}
                      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
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
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-xs xl:text-xs font-semibold transition cursor-pointer ${
                        isParentActive
                          ? "auction-nav-active"
                          : "auction-nav-idle"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 flex-shrink-0" />
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
                      <div className="ml-6 mt-1 space-y-1  border-[var(--secondary-light)] pl-3">
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
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                                isSubActive
                                  ? "auction-nav-active"
                                  : "auction-nav-idle"
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
          </aside>

          {/* CONTENT */}
          <section
            className={`col-span-12 transition-all duration-300 ${
              sidebarCollapsed ? "md:col-span-11" : "md:col-span-10"
            } min-h-0`}
          >
            <div className="auction-content-panel min-h-[calc(100vh-108px)] overflow-visible text-[var(--text-primary)] scrollbar-hide">
              {renderTab()}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AuctionDetails;
