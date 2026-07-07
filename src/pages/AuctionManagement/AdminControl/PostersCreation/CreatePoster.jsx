import React, { useCallback, useEffect, useRef, useState } from "react";
import logo from "../../../../../public/Crickbro_auction_logo.png";
import ThemeOne from "./PlayerPosters/ThemeOne";
import ThemeTwo from "./PlayerPosters/ThemeTwo";
import ThemeThree from "./PlayerPosters/ThemeThree";
import ThemeFour from "./PlayerPosters/ThemeFour";
import ThemeFive from "./PlayerPosters/ThemeFive";
import TeamPosterLayout from "./TeamPosters/TeamPosterLayout";
import PlayersList from "./PlayersList";
import { useParams } from "react-router-dom";
import api from "../../../../utils/api";
import {
  Download,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronDown,
  Settings,
  EyeOff,
  LayoutTemplate,
  RotateCcw,
  SlidersHorizontal,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { fetchAuctionDetails } from "../../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";

const DisplayCheckbox = ({ label, option, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]">
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onChange(option)}
      className="h-4 w-4 rounded border-[var(--border-card)] accent-[var(--secondary)]"
    />
    <span className="text-xs font-semibold sm:text-sm">{label}</span>
  </label>
);

const CreatePoster = () => {
  const { auctionId } = useParams();

  // State declarations
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [teamIdFilter, setTeamIdFilter] = useState("");
  const [categoryFilterName, setCategoryFilterName] = useState("");
  const [teams, setTeams] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingPlayer, setViewingPlayer] = useState([]);
  const [selectedPlayerMap, setSelectedPlayerMap] = useState({});
  const [selectedTheme, setSelectedTheme] = useState("ThemeOne");
  const [selectedTeamTheme, setSelectedTeamTheme] = useState("TeamPoster1");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(true);
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);
  const [posterType, setPosterType] = useState("player");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPosterData, setTeamPosterData] = useState(null);
  const [teamPosterLoading, setTeamPosterLoading] = useState(false);
  const [teamPosterError, setTeamPosterError] = useState("");
  const [teamPosterDownloading, setTeamPosterDownloading] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [teamSearchDebounced, setTeamSearchDebounced] = useState("");
  const [teamApiPage, setTeamApiPage] = useState(1);
  const [teamHasMore, setTeamHasMore] = useState(true);
  const [teamListLoading, setTeamListLoading] = useState(false);
  const teamLoadingRef = useRef(false);
  const auctionDetails = useSelector((state)=>state?.data?.auctionDetails)
  const dispatch=useDispatch()

  // Display options state
  const [displayOptions, setDisplayOptions] = useState({
    showAuctionStatus: true,
    showTeamName: true,
    showBasePrice: true,
    showSoldPrice: true,
    showBatchId: true,
    showPlayerRole: false,
    showPlayerNationality: false,
    showJerseyNumber: false,
  });

  // Check screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowPlayerList(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch players with filters - CORRECTED VERSION
  const fetchPlayersWithFilters = useCallback(
    async (page = 1) => {
      if (!auctionId) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("limit", itemsPerPage.toString());
        params.append("page", page.toString());
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (statusFilter) params.append("status", statusFilter);
        if (teamIdFilter) params.append("teamId", teamIdFilter);
        if (categoryFilterName) params.append("categoryId", categoryFilterName);

        const url = `/webSiteApi/auction/getAllPlayersAdmin/${auctionId}?${params.toString()}`;
        const res = await api.get(url);

        const responseData = res.data;
        let playersData = [];

        if (Array.isArray(responseData?.data)) {
          playersData = responseData.data;
        } else if (Array.isArray(responseData?.data?.data)) {
          playersData = responseData.data.data;
        } else if (Array.isArray(responseData)) {
          playersData = responseData;
        } else {
          playersData = [];
        }

        if (Array.isArray(playersData) && playersData.length > 0) {
          setPlayers(playersData);

          const total =
            responseData?.total ||
            responseData?.data?.total ||
            responseData?.data?.data?.total ||
            playersData.length;

          const pages =
            responseData?.pages ||
            responseData?.data?.pages ||
            responseData?.data?.data?.pages ||
            Math.ceil(total / itemsPerPage);

          setTotalPlayers(total);
          setTotalPages(pages);
          setCurrentPage(page);
        } else {
          setPlayers([]);
          setTotalPlayers(0);
          setTotalPages(0);
        }
      } catch (error) {
        console.error("❌ Error fetching players:", error);
        toast.error("Failed to fetch players");
        setPlayers([]);
        setTotalPlayers(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [
      auctionId,
      debouncedSearch,
      statusFilter,
      teamIdFilter,
      categoryFilterName,
      itemsPerPage,
    ],
  );

  // Fetch teams from API
  const fetchTeams = useCallback(async (page = 1, append = false, query = "") => {
    if (!auctionId || teamLoadingRef.current) return;

    teamLoadingRef.current = true;
    setTeamListLoading(true);
    try {
      const limit = 20;
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (query.trim()) params.append("search", query.trim());

      const res = await api.get(
        `/webSiteApi/auction/getAuctionTeams/${auctionId}?${params.toString()}`,
      );

      const responseData = res?.data;
      const teamsData =
        responseData?.data?.data || responseData?.data || responseData;
      const pageItems = Array.isArray(teamsData) ? teamsData : [];

      const totalPages =
        responseData?.pages ||
        responseData?.data?.pages ||
        responseData?.data?.data?.pages ||
        0;
      const totalTeams =
        responseData?.total ||
        responseData?.data?.total ||
        responseData?.data?.data?.total ||
        0;

      setTeams((currentTeams) => {
        const combined = append ? [...currentTeams, ...pageItems] : pageItems;
        return Array.from(
          new Map(combined.map((team) => [team?.teamId, team])).values(),
        ).filter((team) => team?.teamId);
      });
      setTeamApiPage(page);
      setTeamHasMore(
        totalPages > 0
          ? page < totalPages
          : totalTeams > 0
            ? page * limit < totalTeams
            : pageItems.length > 0,
      );
    } catch (error) {
      console.error("❌ Failed to fetch teams:", error);
      if (!append) setTeams([]);
    } finally {
      teamLoadingRef.current = false;
      setTeamListLoading(false);
    }
  }, [auctionId]);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    if (!auctionId) return;

    try {
      const res = await api.get(
        `/webSiteApi/auctionCategory/listCategories?auctionId=${auctionId}`,
      );

      const categoryData = res.data?.data?.data || res.data?.data || res.data;
      if (Array.isArray(categoryData)) {
        setApiCategories(categoryData);
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    }
  }, [auctionId]);

  // Initial load
  useEffect(() => {
    if (auctionId) {
      dispatch(fetchAuctionDetails(auctionId));
      Promise.resolve().then(() => {
        fetchPlayersWithFilters(1);
        fetchCategories();
      });
    }
  }, [auctionId, dispatch, fetchPlayersWithFilters, fetchCategories]);

  // Reset page when filters change
  useEffect(() => {
    Promise.resolve().then(() => fetchPlayersWithFilters(1));
  }, [
    debouncedSearch,
    statusFilter,
    teamIdFilter,
    categoryFilterName,
    itemsPerPage,
    fetchPlayersWithFilters,
  ]);

  // Debounce main player search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce team dropdown search
  useEffect(() => {
    const timer = setTimeout(() => {
      setTeamSearchDebounced(teamSearchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [teamSearchQuery]);

  // Remote team search / pagination
  useEffect(() => {
    Promise.resolve().then(() => {
      setTeamApiPage(1);
      setTeamHasMore(true);
      fetchTeams(1, false, teamSearchDebounced);
    });
  }, [teamSearchDebounced, fetchTeams]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTeamIdFilter("");
    setCategoryFilterName("");
    setShowFilters(false);
  };

  // Get active filter count
  const activeFilterCount = [
    debouncedSearch,
    statusFilter,
    teamIdFilter,
    categoryFilterName,
  ].filter(Boolean).length;

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPlayersWithFilters(page);
  };

  const handleSelected = (selectedIds) => {
    const currentPageIds = players.map((player) => player.playerId);
    const nextPlayerMap = { ...selectedPlayerMap };

    currentPageIds.forEach((id) => {
      if (!selectedIds.includes(id)) {
        delete nextPlayerMap[id];
      }
    });

    players.forEach((player) => {
      if (selectedIds.includes(player.playerId)) {
        nextPlayerMap[player.playerId] = player;
      }
    });

    const selectedPlayers = selectedIds
      .map((id) => nextPlayerMap[id])
      .filter(Boolean);

    setSelectedPlayerMap(nextPlayerMap);
    setViewingPlayer(selectedPlayers);
    // On mobile, switch to poster view after selecting a player
    if (isMobileView && selectedPlayers.length > 0) {
      setShowPlayerList(false);
    }
  };

  const handleDisplayOptionChange = (option) => {
    setDisplayOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const toBase64 = (src) =>
    new Promise((resolve) => {
      if (!src || src.startsWith("data:")) {
        resolve(src);
        return;
      }

      const loadImage = (url) =>
        new Promise((res) => {
          const img = new Image();
          img.crossOrigin = "anonymous";

          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || 300;
            canvas.height = img.naturalHeight || 300;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            try {
              res(canvas.toDataURL("image/png"));
            } catch {
              res(null);
            }
          };

          img.onerror = () => res(null);
          img.src = url;
        });

      loadImage(src).then((result) => {
        if (result) {
          resolve(result);
        } else {
          // fallback proxy (important for CORS images)
          const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(
            src,
          )}`;
          loadImage(proxied).then((r) => resolve(r || src));
        }
      });
    });

  const waitForImages = async (element) => {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        if (typeof img.decode === "function") {
          return img.decode().catch(() => undefined);
        }

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }),
    );
  };

  const slugify = (value) =>
    String(value || "poster")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "poster";

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const renderSinglePoster = (player) => {
    const auctionStatus =
      player?.status === "sold"
        ? "SOLD"
        : player?.status === "unsold"
          ? "UNSOLD"
          : "AVAILABLE";

    const themeProps = {
      playerName: player?.player?.name,
      playerImage: player?.player?.logo,
      tournamentName: player?.tournamentDetails?.name,
      basePrice: player?.basePrice,
      finalPrice: player?.finalPrice,
      logo,
      teamLogo: player?.soldToLogo,
      tournamentLogo: player?.tournamentDetails?.logo,
      displayOptions,
      auctionStatus,
      teamName: player?.soldTo?.name,
      playerRole: player?.player?.playerRole,
      batchId: player?.player?.batchId,
    };

    switch (selectedTheme) {
      case "ThemeOne":
        return <ThemeOne {...themeProps} />;
      case "ThemeTwo":
        return <ThemeTwo {...themeProps} />;
      case "ThemeThree":
        return <ThemeThree {...themeProps} />;
      case "ThemeFour":
        return <ThemeFour {...themeProps} />;
      case "ThemeFive":
        return <ThemeFive {...themeProps} />;
      default:
        return <ThemeOne {...themeProps} />;
    }
  };

  // Helper to render selected theme with display options
  const renderTheme = () => {
    const selectedPlayer = viewingPlayer?.[0];
    const auctionStatus =
      selectedPlayer?.status === "sold"
        ? "SOLD"
        : selectedPlayer?.status === "unsold"
          ? "UNSOLD"
          : "AVAILABLE";

    const themeProps = {
      playerName: selectedPlayer?.player?.name,
      playerImage: selectedPlayer?.player?.logo,
      tournamentName: selectedPlayer?.tournamentDetails?.name,
      basePrice: selectedPlayer?.basePrice,
      finalPrice: selectedPlayer?.finalPrice,
      logo,
      teamLogo: selectedPlayer?.soldToLogo,
      tournamentLogo: selectedPlayer?.tournamentDetails?.logo,
      displayOptions,
      auctionStatus,
      teamName: selectedPlayer?.soldTo?.name,
      playerRole: selectedPlayer?.player?.playerRole,
      batchId: selectedPlayer?.player?.batchId,
    };

    switch (selectedTheme) {
      case "ThemeOne":
        return <ThemeOne {...themeProps} />;
      case "ThemeTwo":
        return <ThemeTwo {...themeProps} />;
      case "ThemeThree":
        return <ThemeThree {...themeProps} />;
      case "ThemeFour":
        return <ThemeFour {...themeProps} />;
      case "ThemeFive":
        return <ThemeFive {...themeProps} />;
      default:
        return <ThemeOne {...themeProps} />;
    }
  };

  const handleDownloadPoster = async () => {
    if (!viewingPlayer || viewingPlayer.length === 0) {
      toast.error("No player selected");
      return;
    }

    try {
      const html2canvas = (await import("html2canvas")).default;
      const JSZip =
        viewingPlayer.length > 1 ? (await import("jszip")).default : null;

      const total = viewingPlayer.length;

      const toastId = toast.loading(`Generating 1/${total}...`);

      const container = document.getElementById("hidden-poster-render");
      if (!container) {
        toast.error("Poster renderer not ready");
        return;
      }
      const { createRoot } = await import("react-dom/client");
      const { flushSync } = await import("react-dom");

      const generatedPosters = [];

      for (let i = 0; i < total; i++) {
        const player = viewingPlayer[i];

        toast.update(toastId, {
          render: `Generating ${i + 1}/${total}...`,
        });

        // 🔥 render hidden
        const root = document.createElement("div");
        root.style.width = "500px";
        root.style.height = "500px";
        root.style.overflow = "hidden";
        root.style.position = "relative";
        root.style.transform = "none";
        root.setAttribute("data-player-poster-export-mount", "true");
        container.appendChild(root);

        const reactRoot = createRoot(root);

        try {
          flushSync(() => {
            reactRoot.render(renderSinglePoster(player));
          });

          await new Promise((r) => setTimeout(r, 400));

          // ✅ FIX IMAGES
          const imgTags = root.querySelectorAll("img");
          for (let img of imgTags) {
            const base64 = await toBase64(img.src);
            if (base64) img.src = base64;
          }

          await waitForImages(root);

          // Wait for fonts
          await document.fonts.load("900 22px Poppins");
          await document.fonts.load("700 12px Poppins");
          await document.fonts.ready;

          // posterElement must be declared BEFORE we use it
          const posterElement =
            root.querySelector("[data-poster-root='true']") || root;

          posterElement.setAttribute("data-player-poster-export-target", "true");
          posterElement.style.width = "500px";
          posterElement.style.height = "500px";
          posterElement.style.minWidth = "500px";
          posterElement.style.minHeight = "500px";
          posterElement.style.maxWidth = "500px";
          posterElement.style.maxHeight = "500px";
          posterElement.style.transform = "none";
          posterElement.style.transformOrigin = "top left";
          posterElement.style.opacity = "1";

          // Force sync reflow now that posterElement exists
          void posterElement.offsetHeight;

          // Double rAF ensures layout has actually painted, not just fonts loaded
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );

          await new Promise((r) => setTimeout(r, 200));

          const canvas = await html2canvas(posterElement, {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
            logging: false,
            width: 500,
            height: 500,
            windowWidth: Math.max(window.innerWidth, 1200),
            windowHeight: Math.max(window.innerHeight, 800),
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc) => {
              const clonedRoot = clonedDoc.querySelector(
                "[data-player-poster-export-target='true']",
              );
              if (clonedRoot) {
                clonedRoot.style.width = "500px";
                clonedRoot.style.height = "500px";
                clonedRoot.style.minWidth = "500px";
                clonedRoot.style.minHeight = "500px";
                clonedRoot.style.maxWidth = "500px";
                clonedRoot.style.maxHeight = "500px";
                clonedRoot.style.transform = "none";
                clonedRoot.style.transformOrigin = "top left";
                clonedRoot.style.opacity = "1";
              }
            },
          });

          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/png", 1);
          });

          if (!blob) {
            throw new Error("Poster image generation failed");
          }

          const playerName = slugify(player?.player?.name || `player-${i + 1}`);
          generatedPosters.push({
            blob,
            fileName: `${String(i + 1).padStart(2, "0")}-${playerName}.png`,
          });

          // 👉 Add new page except first
          // Image blob is collected above for PNG/ZIP download.
        } finally {
          reactRoot.unmount();
          if (root.parentNode === container) {
            container.removeChild(root);
          }
        }
      }

      if (generatedPosters.length === 0) {
        toast.error("No poster image generated");
        return;
      }

      if (generatedPosters.length === 1) {
        downloadBlob(generatedPosters[0].blob, generatedPosters[0].fileName);
      } else {
        const zip = new JSZip();
        generatedPosters.forEach((poster) => {
          zip.file(poster.fileName, poster.blob);
        });

        toast.update(toastId, {
          render: "Creating ZIP...",
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "posters.zip");
      }

      toast.update(toastId, {
        render:
          generatedPosters.length === 1
            ? "Poster image ready"
            : "Poster ZIP ready",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Poster download failed");
    }
  };

  const filteredPosterTeams = teams.filter((team) => {
    const name = team?.teamName || team?.teamDoc?.name || team?.name || "";
    return name.toLowerCase().includes(teamSearchQuery.trim().toLowerCase());
  });
  const selectedTeamName =
    selectedTeam?.teamName || selectedTeam?.teamDoc?.name || selectedTeam?.name || "";

  const handleTeamPosterSelect = async (team) => {
    setSelectedTeam(team);
    setTeamDropdownOpen(false);
    setTeamPosterLoading(true);
    setTeamPosterError("");
    try {
      const response = await api.get(
        `/webSiteApi/auctionTeam/getTeamWithSoldPlayers/${auctionId}/${team.teamId}`,
      );
      const payload = response?.data?.data || {};
      const players = payload?.players?.list || [];
      const apiTeam = payload?.team || payload?.teamDetails || payload?.auctionTeam || {};
      const normalizedTeam = {
        ...team,
        ...apiTeam,
        teamName:
          apiTeam?.teamName || apiTeam?.teamDoc?.name || apiTeam?.name ||
          team?.teamName || team?.teamDoc?.name || team?.name,
        teamDoc: {
          ...(team?.teamDoc || {}),
          ...(apiTeam?.teamDoc || {}),
          logo:
            apiTeam?.teamDoc?.logo || apiTeam?.teamLogo || apiTeam?.logo ||
            team?.teamDoc?.logo || team?.teamLogo || team?.logo,
        },
      };
      const normalizedPlayers = players.map((entry) => {
        const player = entry?.playerId || entry?.player || entry || {};
        return {
          ...entry,
          playerId: player?._id || entry?.playerId,
          name: player?.name || entry?.name,
          profilePicture: player?.logo || player?.profilePicture || entry?.profilePicture,
          playerRole: player?.playerRole || player?.role || entry?.playerRole,
          batchId: player?.batchId || entry?.batchId,
          basePrice: entry?.basePrice || player?.basePrice || 0,
          soldPrice: entry?.finalPrice || entry?.soldPrice || player?.soldPrice || 0,
        };
      });
      setTeamPosterData({
        team: normalizedTeam,
        players: normalizedPlayers,
        tournament:
          payload?.tournament || payload?.tournamentDetails ||
          payload?.auction?.tournamentId || players?.[0]?.tournamentDetails ||
          team?.tournamentDetails || null,
      });
    } catch (error) {
      console.error("Failed to fetch team poster data:", error);
      setTeamPosterData(null);
      setTeamPosterError("Unable to load this team's poster data.");
      toast.error("Failed to load team poster data");
    } finally {
      setTeamPosterLoading(false);
    }
  };

  const renderTeamPoster = () => {
    if (!teamPosterData) return null;
    const props = {
      team: teamPosterData.team,
      players: teamPosterData.players,
      tournamentName: auctionDetails?.tournamentId?.name,
      tournamentLogo: auctionDetails?.tournamentId?.logo,
      tournament: {
        name: auctionDetails?.tournamentId?.name,
        logo: auctionDetails?.tournamentId?.logo,
      },
    };
    const variant = Number(selectedTeamTheme.replace("TeamPoster", "")) || 1;
    return <TeamPosterLayout variant={variant} {...props} />;
  };

  const handleDownloadTeamPoster = async () => {
    if (!teamPosterData) {
      toast.error("Select a team first");
      return;
    }

    setTeamPosterDownloading(true);
    const toastId = toast.loading("Generating team poster...");
    let reactRoot = null;
    let exportMount = null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { createRoot } = await import("react-dom/client");
      const { flushSync } = await import("react-dom");
      const exportHost = document.getElementById("team-poster-export-root");

      if (!exportHost) throw new Error("Team poster renderer not ready");

      exportMount = document.createElement("div");
      exportMount.style.width = "1200px";
      exportMount.style.minHeight = "675px";
      exportMount.style.height = "auto";
      exportMount.style.position = "relative";
      exportMount.style.overflow = "visible";
      exportHost.appendChild(exportMount);

      reactRoot = createRoot(exportMount);
      flushSync(() => {
        reactRoot.render(renderTeamPoster());
      });

      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const posterElement = exportMount.querySelector(
        "[data-poster-root='true']",
      );
      if (!posterElement) throw new Error("Team poster could not be rendered");

      posterElement.style.width = "1200px";
      posterElement.style.height = "auto";
      posterElement.style.minHeight = "675px";
      posterElement.style.maxWidth = "none";
      posterElement.style.transform = "none";

      for (const image of posterElement.querySelectorAll("img")) {
        const base64 = await toBase64(image.src);
        if (base64) image.src = base64;
      }
      await waitForImages(posterElement);
      await document.fonts.ready;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const measurePosterHeight = () => {
        return Math.ceil(Math.max(675, posterElement.scrollHeight));
      };

      let exportHeight = measurePosterHeight();

      exportMount.style.height = `${exportHeight}px`;
      posterElement.style.height = `${exportHeight}px`;

      const canvas = await html2canvas(posterElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: 1200,
        height: exportHeight,
        windowWidth: 1200,
        windowHeight: exportHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDocument) => {
          const clonedPoster = clonedDocument
            .getElementById("team-poster-export-root")
            ?.querySelector("[data-poster-root='true']");
          if (clonedPoster) {
            clonedPoster.style.width = "1200px";
            clonedPoster.style.height = `${exportHeight}px`;
            clonedPoster.style.minHeight = "675px";
            clonedPoster.style.maxWidth = "none";
            clonedPoster.style.transform = "none";
          }
        },
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
      if (!blob) throw new Error("Poster image generation failed");
      downloadBlob(blob, `${slugify(selectedTeamName)}-${selectedTeamTheme.toLowerCase()}.png`);
      toast.update(toastId, { render: "Team poster downloaded", type: "success", isLoading: false, autoClose: 2000 });
    } catch (error) {
      console.error("Team poster download failed:", error);
      toast.update(toastId, { render: "Failed to download team poster", type: "error", isLoading: false, autoClose: 2500 });
    } finally {
      if (reactRoot) reactRoot.unmount();
      if (exportMount?.parentNode) exportMount.parentNode.removeChild(exportMount);
      setTeamPosterDownloading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-112px)] flex-col bg-[var(--bg-main)] text-[var(--text-primary)] md:h-full md:min-h-0">
      <div
        id="hidden-poster-render"
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "500px",
          height: "500px",
          overflow: "hidden",
          opacity: 1,
          pointerEvents: "none",
        }}
      />
      <div
        id="team-poster-export-root"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-20000px",
          width: "1200px",
          minHeight: "675px",
          height: "auto",
          overflow: "visible",
          pointerEvents: "none",
        }}
      />

      <div className="shrink-0 border-b border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-3 md:px-4">
        <div className="mx-auto grid w-full max-w-md grid-cols-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setPosterType("player")}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition ${
              posterType === "player"
                ? "bg-[var(--secondary)] text-[#102033] shadow-[0_6px_18px_rgba(255,196,0,0.2)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
            }`}
          >
            <UserRound className="h-4 w-4" />
            Player Poster
          </button>
          <button
            type="button"
            onClick={() => setPosterType("team")}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition ${
              posterType === "team"
                ? "bg-[var(--secondary)] text-[#102033] shadow-[0_6px_18px_rgba(255,196,0,0.2)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
            }`}
          >
            <Users className="h-4 w-4" />
            Team Poster
          </button>
        </div>
      </div>

      {posterType === "player" && isMobileView && (
        <div className="shrink-0 border-b border-[var(--border-card)] bg-[var(--bg-card)] p-3">
          <div className="grid grid-cols-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-1">
            <button
              onClick={() => setShowPlayerList(true)}
              className={`rounded-md px-3 py-2 text-center text-sm font-bold transition ${
                showPlayerList
                  ? "bg-[var(--secondary)] text-[#102033] shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Select Players
            </button>
            <button
              onClick={() => setShowPlayerList(false)}
              className={`rounded-md px-3 py-2 text-center text-sm font-bold transition ${
                !showPlayerList
                  ? "bg-[var(--secondary)] text-[#102033] shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Poster Preview
            </button>
          </div>
        </div>
      )}

      {posterType === "player" ? (
      <div
        className={`min-h-0 flex-1 gap-3 p-3 md:p-4 ${
          isMobileView ? "overflow-hidden" : "overflow-y-auto xl:overflow-hidden"
        } flex flex-col xl:flex-row`}
      >
        {/* Left: Select Players Panel */}
        <div
          className={`${
            isMobileView
              ? showPlayerList
                ? "flex-1"
                : "hidden"
              : "w-full xl:w-[440px] 2xl:w-[500px] xl:shrink-0"
          } flex min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]`}
        >
          <div className="shrink-0 border-b border-[var(--border-card)] p-3 md:p-4">
            {/* Header Section */}
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-[#102033]">
                    <LayoutTemplate className="h-4 w-4" />
                  </span>
                  <h1 className="truncate text-base font-bold text-[var(--text-primary)] sm:text-lg">
                    Select Players
                  </h1>
                </div>
                {totalPlayers > 0 && (
                  <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                    {totalPlayers} players available
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-2 py-1">
                  <span className="whitespace-nowrap text-xs font-semibold text-[var(--text-secondary)]">
                    Items:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="h-8 rounded-md border-0 bg-transparent px-1 text-xs font-bold text-[var(--text-primary)] outline-none"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Reset button - hidden on mobile to save space */}
                {!isMobileView && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-9 pr-3 text-sm font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                    showFilters || activeFilterCount > 0
                      ? "border-[var(--secondary)] bg-[var(--secondary)] text-[#102033]"
                      : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Filters Panel - Responsive grid layout */}
              {showFilters && (
                <div className="mt-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-bold uppercase text-[var(--text-secondary)]">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          const value = e.target.value;
                          setStatusFilter(value);
                          if (value === "unsold") setTeamIdFilter("");
                        }}
                        className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
                      >
                        <option value="">All</option>
                        <option value="sold">Sold</option>
                        <option value="unsold">Unsold</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-bold uppercase text-[var(--text-secondary)]">
                        Team
                      </label>
                      <select
                        value={teamIdFilter}
                        onChange={(e) => setTeamIdFilter(e.target.value)}
                        disabled={statusFilter === "unsold"}
                        className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">All Teams</option>
                        {teams.map((team) => (
                          <option key={team.teamId} value={team.teamId}>
                            {team.teamName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-bold uppercase text-[var(--text-secondary)]">
                        Category
                      </label>
                      <select
                        value={categoryFilterName}
                        onChange={(e) => setCategoryFilterName(e.target.value)}
                        className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
                      >
                        <option value="">All</option>
                        {apiCategories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Reset button for mobile */}
                    {isMobileView && (
                      <div className="flex items-end sm:col-span-2 xl:col-span-3">
                        <button
                          onClick={resetFilters}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Players List - Scrollable */}
          <div className="h-[445px] shrink-0 overflow-hidden p-3 pt-0 md:p-4 md:pt-0">
            <PlayersList
              players={players}
              loading={loading}
              totalPlayers={totalPlayers}
              totalPages={totalPages}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              teamIdFilter={teamIdFilter}
              categoryFilterName={categoryFilterName}
              onPageChange={handlePageChange}
              onSelectionChange={handleSelected}
            />
          </div>
        </div>

        {/* Right: Theme Preview Panel */}
        <div
          className={`${
            isMobileView ? (!showPlayerList ? "flex-1" : "hidden") : "min-h-[560px] xl:min-h-0 xl:flex-1"
          } flex min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]`}
        >
          {/* Theme Selector and Controls */}
          <div className="w-full shrink-0 border-b border-[var(--border-card)] p-3 md:p-4">
            {/* Back button for mobile */}
            {isMobileView && !showPlayerList && viewingPlayer.length > 0 && (
              <button
                onClick={() => setShowPlayerList(true)}
                className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)]"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Players
              </button>
            )}

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <label
                  htmlFor="theme-select"
                  className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[var(--secondary)]" />
                  Theme
                </label>
                <select
                  id="theme-select"
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="h-10 min-w-44 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--border-primary)]"
                >
                  <option value="ThemeOne">Theme One</option>
                  <option value="ThemeTwo">Theme Two</option>
                  <option value="ThemeThree">Theme Three</option>
                  <option value="ThemeFour">Theme Four</option>
                  <option value="ThemeFive">Theme Five</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  onClick={() => setShowDisplayOptions(!showDisplayOptions)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Options</span>
                </button>

                <button
                  onClick={handleDownloadPoster}
                  disabled={!viewingPlayer || viewingPlayer.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-3 text-sm font-bold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
              </div>
            </div>
          </div>

          {/* Display Options Panel */}
          {showDisplayOptions && (
            <div className="mx-3 mt-3 w-[calc(100%-1.5rem)] shrink-0 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 shadow-sm md:mx-4 md:w-[calc(100%-2rem)] md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Poster Display Options
                </h3>
                <button
                  onClick={() => setShowDisplayOptions(false)}
                  className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <DisplayCheckbox
                  label="Show Auction Status (Sold/Unsold)"
                  option="showAuctionStatus"
                  checked={displayOptions.showAuctionStatus}
                  onChange={handleDisplayOptionChange}
                />
                <DisplayCheckbox
                  label="Show Team Name"
                  option="showTeamName"
                  checked={displayOptions.showTeamName}
                  onChange={handleDisplayOptionChange}
                />
                <DisplayCheckbox
                  label="Show Base Price"
                  option="showBasePrice"
                  checked={displayOptions.showBasePrice}
                  onChange={handleDisplayOptionChange}
                />
                <DisplayCheckbox
                  label="Show Final / Sold Price"
                  option="showSoldPrice"
                  checked={displayOptions.showSoldPrice}
                  onChange={handleDisplayOptionChange}
                />
                {/* <DisplayCheckbox 
                  label="Show Player Role" 
                  option="showPlayerRole" 
                  checked={displayOptions.showPlayerRole}
                /> */}

                <DisplayCheckbox
                  label="Show Batch ID"
                  option="showBatchId"
                  checked={displayOptions.showBatchId}
                  onChange={handleDisplayOptionChange}
                />
              </div>
            </div>
          )}

          {/* Poster Preview Area */}
          <div
            id="poster-container"
            className="min-h-0 w-full flex-1 overflow-auto p-3 md:p-4"
          >
            {viewingPlayer && viewingPlayer.length > 0 ? (
              <div className="flex min-h-full items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-4">
                <div className="origin-center scale-[0.68] sm:scale-[0.78] md:scale-[0.86] lg:scale-[0.92] xl:scale-100">
                  {renderTheme()}
                </div>
              </div>
            ) : (
              <div className="flex min-h-full items-center justify-center rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] p-4 text-center text-[var(--text-secondary)]">
                <div>
                  <EyeOff className="mx-auto mb-3 h-12 w-12 text-[var(--text-muted)]" />
                  <p className="mb-2 font-bold text-[var(--text-primary)]">
                    No player selected
                  </p>
                  <p className="text-sm">
                    Select a player from the left panel to generate poster
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="flex min-h-[70vh] flex-1 flex-col gap-3 overflow-y-auto p-3 md:p-4 xl:overflow-hidden">
          <div className="relative z-30 flex w-full shrink-0 flex-col items-stretch gap-4 overflow-visible rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] lg:flex-row lg:items-center">
            <div className="w-full shrink-0 lg:w-[240px]">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--secondary)] text-[#102033]">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Select Team</h2>
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">{teams.length} teams available</p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTeamDropdownOpen((open) => !open)}
                  className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-left transition hover:border-[var(--border-primary)]"
                  aria-expanded={teamDropdownOpen}
                >
                  <span className={`truncate text-sm font-semibold ${selectedTeam ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                    {selectedTeamName || "Select a team"}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--primary)] transition ${teamDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {teamDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-full max-h-[calc(100vh-190px)] overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
                    onWheel={(event) => event.stopPropagation()}
                  >
                    <div className="border-b border-[var(--border-card)] p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input
                          type="text"
                          value={teamSearchQuery}
                          onChange={(event) => {
                            setTeamSearchQuery(event.target.value);
                          }}
                          placeholder="Search team..."
                          className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] pl-9 pr-3 text-sm font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)]"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div
                      className="h-[300px] max-h-[calc(100vh-290px)] space-y-1 overflow-y-scroll overscroll-contain p-2"
                      onScroll={(event) => {
                        const element = event.currentTarget;
                        const reachedBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 36;
                        if (reachedBottom && teamHasMore && !teamListLoading) {
                          fetchTeams(teamApiPage + 1, true, teamSearchDebounced);
                        }
                      }}
                    >
                      {filteredPosterTeams.length > 0 ? filteredPosterTeams.map((team) => {
                        const teamName = team?.teamName || team?.teamDoc?.name || team?.name || "Unnamed Team";
                        const teamLogo = team?.teamLogo || team?.teamDoc?.logo || team?.logo;
                        const isSelected = selectedTeam?.teamId === team?.teamId;
                        return (
                          <button
                            type="button"
                            key={team.teamId}
                            onClick={() => handleTeamPosterSelect(team)}
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                              isSelected
                                ? "border-[var(--secondary)] bg-[var(--secondary-light)]"
                                : "border-transparent hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                            }`}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)]">
                              {teamLogo ? <img src={teamLogo} alt="" className="h-full w-full object-contain" /> : <Users className="h-4 w-4 text-[var(--primary)]" />}
                            </span>
                            <span className="truncate text-sm font-bold text-[var(--text-primary)]">{teamName}</span>
                          </button>
                        );
                      }) : (
                        <div className="px-3 py-8 text-center text-sm font-semibold text-[var(--text-secondary)]">No teams found</div>
                      )}
                    </div>

                    <div className="border-t border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-center">
                      <span className="text-xs font-bold text-[var(--text-secondary)]">
                        {teamListLoading
                          ? "Loading more teams..."
                          : teamHasMore
                            ? "Scroll down to load more teams"
                            : `${teams.length} teams loaded`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedTeamTheme}
                  onChange={(event) => setSelectedTeamTheme(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 pr-9 text-sm font-semibold text-[var(--text-primary)] outline-none transition hover:border-[var(--border-primary)] focus:border-[var(--border-primary)]"
                  aria-label="Select team poster theme"
                >
                  <option value="TeamPoster1">Team Theme One</option>
                  <option value="TeamPoster2">Team Theme Two</option>
                  <option value="TeamPoster3">Team Theme Three</option>
                  <option value="TeamPoster4">Team Theme Four</option>
                  <option value="TeamPoster5">Team Theme Five</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--primary)]" />
              </div>

              <button
                type="button"
                onClick={handleDownloadTeamPoster}
                disabled={!teamPosterData || teamPosterDownloading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-bold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {teamPosterDownloading ? "Generating..." : "Download PNG"}
              </button>

              {/* <p className="mt-3 text-xs font-medium text-[var(--text-secondary)]">
                Search loaded teams or scroll.
              </p> */}
            </div>
          </div>

          <div id="team-poster-preview" className="relative z-0 flex min-h-[560px] w-full flex-1 items-center justify-center overflow-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] md:p-4 xl:min-h-0">
            {teamPosterLoading ? (
              <div className="text-sm font-bold text-[var(--primary)]">Loading team poster...</div>
            ) : teamPosterError ? (
              <div className="text-sm font-bold text-red-500">{teamPosterError}</div>
            ) : teamPosterData ? (
              <div className="relative h-[189px] w-[336px] shrink-0 sm:h-[338px] sm:w-[600px] md:h-[378px] md:w-[672px] lg:h-[419px] lg:w-[744px] xl:h-[486px] xl:w-[864px]">
                <div className="absolute left-0 top-0 origin-top-left scale-[0.28] sm:scale-[0.5] md:scale-[0.56] lg:scale-[0.62] xl:scale-[0.72]">
                  {renderTeamPoster()}
                </div>
              </div>
            ) : (
            <div className="text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-[var(--primary)]" />
              <h2 className="font-bold text-[var(--text-primary)]">
                {selectedTeam ? (selectedTeam?.teamName || selectedTeam?.teamDoc?.name || selectedTeam?.name || "Selected Team") : "Select a team"}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {selectedTeam ? "Team poster preview will be configured here." : "Choose a team from the list to create its poster."}
              </p>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePoster;
