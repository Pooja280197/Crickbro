import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  createAuction,
  editAuction,
  fetchAuctionDetails,
  getMyTournaments,
} from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Gavel,
  Info,
  Trophy,
  Users,
} from "lucide-react";

/* ---------- UI HELPERS ---------- */

const Section = ({ title, children, defaultOpen = false, helper = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
  <section className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
    <button
      type="button"
      onClick={() => setIsOpen((prev) => !prev)}
      className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-left transition hover:bg-[var(--secondary-lighter)]"
    >
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {helper ? (
          <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {helper}
          </p>
        ) : null}
      </div>
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-[var(--text-secondary)] transition ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    {isOpen && <div className="space-y-4 bg-[var(--bg-soft)] p-4">{children}</div>}
  </section>
  );
};

const SummaryItem = ({ icon: Icon, label, value, done }) => (
  <div className="flex items-center gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        done
          ? "bg-[var(--accent-light)] text-[var(--primary)]"
          : "bg-[var(--secondary-lighter)] text-[var(--text-secondary)]"
      }`}
    >
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[var(--text-primary)]">
        {value || "Not set"}
      </p>
    </div>
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
);

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  inputMode,
  placeholder = "",
  tooltip = "",
}) => (
  <div className="space-y-1.5">
    <label
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]"
      title={tooltip}
    >
      {label}
      {tooltip ? <Info className="h-3.5 w-3.5 text-[var(--text-secondary)]" /> : null}
    </label>

    {/* {tooltip && (
        <Tooltip text={tooltip}>
          <span className="text-xs text-gray-400">ⓘ</span>
        </Tooltip>
      )} */}
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--primary)]/10"
    />
  </div>
);

const NumberInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  tooltip = "",
  allowDecimal = false,
}) => (
  <Input
    type="text"
    inputMode={allowDecimal ? "decimal" : "numeric"}
    label={label}
    placeholder={placeholder}
    value={value}
    tooltip={tooltip}
    onChange={(v) => {
      const sanitized = allowDecimal
        ? String(v || "")
            .replace(/[^\d.]/g, "")
            .replace(/(\..*)\./g, "$1")
        : String(v || "").replace(/\D/g, "");
      onChange?.(sanitized);
    }}
  />
);

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  loading = false,
  tooltip = "",
}) => {
  const getOptionValue = (opt) => {
    if (typeof opt === "string") return opt;
    return opt?._id ?? opt?.id ?? opt?.tournamentId ?? opt?.value ?? "";
  };

  const getOptionLabel = (opt) => {
    if (typeof opt === "string") {
      return opt.charAt(0).toUpperCase() + opt.slice(1);
    }
    return (
      opt?.name ??
      opt?.tournamentName ??
      opt?.title ??
      opt?.label ??
      String(opt || "")
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]" title={tooltip}>
        {label}
        {tooltip ? <Info className="h-3.5 w-3.5 text-[var(--text-secondary)]" /> : null}
      </label>
      {/* {tooltip && (
          <Tooltip text={tooltip}>
            <span className="text-xs text-gray-400">ⓘ</span>
          </Tooltip>
        )} */}
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--primary)]/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {/* Loading state */}
        {loading ? (
          <option>Loading...</option>
        ) : options?.length === 0 ? (
          /* Empty state */
          <option>No options available</option>
        ) : (
          <>
            {/* Placeholder */}
            <option value="" disabled>
              {placeholder || "Select option"}
            </option>

            {options?.map((opt, index) => {
              const val = getOptionValue(opt);
              const labelText = getOptionLabel(opt);

              return (
                <option key={val || index} value={val}>
                  {labelText}
                </option>
              );
            })}
          </>
        )}
      </select>
    </div>
  );
};

const Toggle = ({ label, checked, onChange, tooltip = "" }) => (
  <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2 sm:gap-4">
    <span className="inline-flex min-w-0 flex-1 flex-wrap items-center gap-1.5 break-words pr-2 text-xs font-semibold leading-5 text-[var(--text-primary)] sm:text-sm" title={tooltip}>
      {label}
      {tooltip ? <Info className="h-3.5 w-3.5 text-[var(--text-secondary)]" /> : null}
    </span>
    {/* {tooltip && (
        <Tooltip text={tooltip}>
          <span className="text-xs text-gray-400">ⓘ</span>
        </Tooltip>
      )} */}
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`create-auction-toggle-switch relative inline-flex !h-5 !min-h-5 !w-9 shrink-0 items-center rounded-full !p-0.5 transition sm:!h-6 sm:!min-h-6 sm:!w-11 sm:!p-1 ${checked ? "bg-[var(--secondary)]" : "bg-[var(--border-card)]"
        }`}
      aria-pressed={checked}
    >
      <span
        className={`create-auction-toggle-knob block !h-4 !w-4 rounded-full bg-white shadow-sm transition ${checked ? "translate-x-4 sm:translate-x-5" : "translate-x-0"
          }`}
      />
    </button>
  </div>
);

const RadioGroup = ({ value, onChange, options }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`flex h-11 items-center justify-between rounded-lg border px-4 text-sm font-semibold transition ${value === opt.value
          ? "border-[var(--border-primary)] bg-[var(--secondary)] text-[#102033] shadow-sm"
          : "border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
          }`}
      >
        <span>{opt.label}</span>
        {value === opt.value ? <Check className="h-4 w-4" /> : null}
      </button>
    ))}
  </div>
);

const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

export default function CreateEditAuction({ theme = "light", onToggleTheme }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auctionId } = useParams();

  const handleGoBack = () => {
    const hasPreviousAppRoute = Number(window.history.state?.idx) > 0;
    const referrer = document.referrer;
    const cameFromSameWebsite =
      referrer && new URL(referrer).origin === window.location.origin;

    if (hasPreviousAppRoute || cameFromSameWebsite) {
      navigate(-1);
      return;
    }

    navigate("/auction");
  };

  const auctionData = useSelector(
    (state) => state.data?.auctionDetails || null,
  );

  useEffect(() => {
    if (auctionId) {
      dispatch(fetchAuctionDetails(auctionId));
    }
  }, []);

  const initialForm = {
    tournamentId: "",
    auctionName: "",
    auctionStartedAt: "",
    auctionEndedAt: "",
    auctionType: "manual",
    auctionStatus: "scheduled",
    trailTypeAuction: false,
    trailStart: "",
    trailEnd: "",
    streamKey: "",
    streamUrl: "",
    playerRegistrationPaid: false,
    feeType: "default",
    registrationFee: "",
    roleBasedFees: {
      batsman: "",
      bowler: "",
      allRounder: "",
      wicketKeeper: "",
    },
    platformFee: "",
    teamPublic: false,
    playerPublic: false,
    showTrialLocations: false,
    showRegistrationForm: false,
    playerRegistrationFiels: {
      profilePicture: true,
      name: true,
      role: true,
      mobileNumber: true,
      location: true,
      email: false,
      dateOfBirth: false,
      gender: false,
      jerseyNumber: true,
      jerseyName: true,
      jerseySize: true,
      lowerSize: false,
      adharCard: false,
      voterId: false,
    },
    gstEnabled: false,
    gstPercentage: "",
    auctionRules: {
      budgetCap: "",
      maxPlayersPerTeam: "",
      minPlayersPerTeam: "",
      maxForeignPlayers: "",
      maxWicketKeepers: "",
      minWicketKeepers: "",
      biddingIncrement: "",
      highPriceIncrement: "",
      minimumBid: "",

      rtmEnabled: false,
      maxRTMCardsPerTeam: "",
      unsoldPlayerReEntry: false,
      acceleratedRoundAfter: "",
      maxReturnPlayersPerTeam: "",
      maxPurchasePlayersPerTeam: "",
      minPurchasePlayersPerTeam: "",
    },

    autoSettings: {
      playerDisplayDuration: "",
      bidIncrementInterval: "",
      autoBidIncrementAmount: "",
      countdownWarningAt: "",
      extendTimeOnBid: "",
    },

    teamRegistration: {
      showTeamRegistration: false,
      teamRegistrationPaid: false,
      teamRegistrationFee: "",
      teamPlatformFee: "",
      teamGstEnabled: false,
      teamGstPercentage: "",
    },

    createdBy: localStorage.getItem("playerId"),
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (auctionId && auctionData) {
      setForm({
        tournamentId: auctionData?.tournament?.id || "",
        auctionName: auctionData?.auctionName || "",
        // auctionDate: formatDateForInput(auctionData?.auctionDate, true),
        auctionStartedAt: formatDateForInput(
          auctionData?.auctionStartedAt,
          true,
        ),
        auctionEndedAt: formatDateForInput(auctionData?.auctionEndedAt, true),
        auctionType: auctionData?.auctionType || "manual",
        auctionStatus: auctionData?.auctionStatus || "scheduled",
        trailTypeAuction: auctionData?.trailTypeAuction || false,
        playerRegistrationPaid: auctionData?.playerRegistrationPaid || false,
        feeType: auctionData?.feeType || "default",
        registrationFee: auctionData?.registrationFee ?? "",
        roleBasedFees: {
          batsman: auctionData?.roleBasedFees?.batsman ?? "",
          bowler: auctionData?.roleBasedFees?.bowler ?? "",
          allRounder: auctionData?.roleBasedFees?.allRounder ?? "",
          wicketKeeper: auctionData?.roleBasedFees?.wicketKeeper ?? "",
        },
        platformFee: auctionData?.platformFee ?? "",
        trailStart: formatDateForInput(auctionData?.trailStart),
        trailEnd: formatDateForInput(auctionData?.trailEnd),

        streamKey: auctionData?.stream?.streamKey || "",
        streamUrl: auctionData?.stream?.streamUrl || "",
        teamPublic: auctionData?.teamPublic || false,
        playerPublic: auctionData?.playerPublic || false,
        showTrialLocations: auctionData?.showTrialLocations || false,
        showRegistrationForm: auctionData?.showRegistrationForm || false,
        playerRegistrationFiels: auctionData?.playerRegistrationFiels || {
          profilePicture: true,
          name: true,
          role: true,
          mobileNumber: true,
          location: true,
          email: false,
          dateOfBirth: false,
          gender: false,
          jerseyNumber: true,
          jerseyName: true,
          jerseySize: true,
          lowerSize: false,
          adharCard: false,
          voterId: false,
        },
        gstEnabled: auctionData?.gstEnabled || false,
        gstPercentage: auctionData?.gstPercentage ?? "",

        auctionRules: {
          budgetCap: auctionData?.auctionRules?.budgetCap ?? "",
          maxPlayersPerTeam: auctionData?.auctionRules?.maxPlayersPerTeam ?? "",
          minPlayersPerTeam: auctionData?.auctionRules?.minPlayersPerTeam ?? "",
          maxForeignPlayers: auctionData?.auctionRules?.maxForeignPlayers ?? "",
          maxWicketKeepers: auctionData?.auctionRules?.maxWicketKeepers ?? "",
          minWicketKeepers: auctionData?.auctionRules?.minWicketKeepers ?? "",
          biddingIncrement: auctionData?.auctionRules?.biddingIncrement ?? "",
          highPriceIncrement:
            auctionData?.auctionRules?.highPriceIncrement ?? "",
          minimumBid: auctionData?.auctionRules?.minimumBid ?? "",
          rtmEnabled: auctionData?.auctionRules?.rtmEnabled || false,

          maxRTMCardsPerTeam:
            auctionData?.auctionRules?.maxRTMCardsPerTeam ?? "",
          unsoldPlayerReEntry:
            auctionData?.auctionRules?.unsoldPlayerReEntry || false,
          acceleratedRoundAfter:
            auctionData?.auctionRules?.acceleratedRoundAfter ?? "",
          maxReturnPlayersPerTeam:
            auctionData?.auctionRules?.maxReturnPlayersPerTeam ?? "",
          maxPurchasePlayersPerTeam:
            auctionData?.auctionRules?.maxPurchasePlayersPerTeam ?? "",
          minPurchasePlayersPerTeam:
            auctionData?.auctionRules?.minPurchasePlayersPerTeam ?? "",
        },

        autoSettings: {
          playerDisplayDuration:
            auctionData?.autoSettings?.playerDisplayDuration ?? "",
          bidIncrementInterval:
            auctionData?.autoSettings?.bidIncrementInterval ?? "",
          autoBidIncrementAmount:
            auctionData?.autoSettings?.autoBidIncrementAmount ?? "",
          countdownWarningAt:
            auctionData?.autoSettings?.countdownWarningAt ?? "",
          extendTimeOnBid: auctionData?.autoSettings?.extendTimeOnBid ?? "",
        },

        teamRegistration: {
          showTeamRegistration: auctionData?.teamRegistration?.showTeamRegistration || false,
          teamRegistrationPaid: auctionData?.teamRegistration?.teamRegistrationPaid || false,
          teamRegistrationFee: auctionData?.teamRegistration?.teamRegistrationFee ?? "",
          teamPlatformFee: auctionData?.teamRegistration?.teamPlatformFee ?? "",
          teamGstEnabled: auctionData?.teamRegistration?.teamGstEnabled || false,
          teamGstPercentage: auctionData?.teamRegistration?.teamGstPercentage ?? "",
        },

        createdBy: localStorage.getItem("playerId"),
      });
    } else {
      setForm(initialForm);
    }
  }, [auctionData]);

  useEffect(() => {
    if (form?.trailTypeAuction === false) {
      setForm((p) => ({ ...p, trailStart: "", trailEnd: "" }));
    }
    if (!form.showRegistrationForm) {
      setForm((p) => ({
        ...p,
        playerRegistrationPaid: false,
        feeType: "default",
        registrationFee: "",
        roleBasedFees: {
          batsman: "",
          bowler: "",
          allRounder: "",
          wicketKeeper: "",
        },
        platformFee: "",
      }));
    }
    if (!form.trailTypeAuction) {
      setForm((p) => ({
        ...p,
        showTrialLocations: false,
      }));
    }
    if (form?.playerRegistrationPaid === false) {
      setForm((p) => ({
        ...p,
        feeType: "default",
        registrationFee: "",
        roleBasedFees: {
          batsman: "",
          bowler: "",
          allRounder: "",
          wicketKeeper: "",
        },
      }));
      setForm((p) => ({ ...p, platformFee: "" }));
      setForm((p) => ({ ...p, gstEnabled: false }));
      setForm((p) => ({ ...p, gstPercentage: "" }));
    }
    if (!form.gstEnabled) {
      setForm((p) => ({ ...p, gstPercentage: "" }));
    }
    // team registration cleanup
    if (!form.teamRegistration?.teamRegistrationPaid) {
      setForm((p) => ({
        ...p,
        teamRegistration: {
          ...p.teamRegistration,
          teamRegistrationFee: "",
          teamPlatformFee: "",
          teamGstEnabled: false,
          teamGstPercentage: "",
        },
      }));
    }
    if (!form.teamRegistration?.teamGstEnabled) {
      setForm((p) => ({
        ...p,
        teamRegistration: { ...p.teamRegistration, teamGstPercentage: "" },
      }));
    }
  }, [
    form.showRegistrationForm,
    form.trailTypeAuction,
    form.playerRegistrationPaid,
    form.gstEnabled,
    form.teamRegistration?.teamRegistrationPaid,
    form.teamRegistration?.teamGstEnabled,
  ]);

  const myTournaments = useSelector((state) => state?.data?.myTournaments);
  const loading = useSelector((state) => state?.loading?.myTournaments);
  const selectedTournament = (myTournaments || []).find((item) => {
    const id = item?._id ?? item?.id ?? item?.tournamentId ?? item?.value;
    return String(id || "") === String(form?.tournamentId || "");
  });
  const selectedTournamentName =
    selectedTournament?.name ||
    selectedTournament?.tournamentName ||
    selectedTournament?.title ||
    selectedTournament?.label ||
    "";
  const setupChecklist = [
    {
      label: "Tournament",
      done: Boolean(form?.tournamentId),
      value: selectedTournamentName,
      icon: Trophy,
    },
    {
      label: "Auction Name",
      done: Boolean(form?.auctionName?.trim()),
      value: form?.auctionName,
      icon: Gavel,
    },
    {
      label: "Auction Dates",
      done: Boolean(form?.auctionStartedAt && form?.auctionEndedAt),
      value:
        form?.auctionStartedAt && form?.auctionEndedAt
          ? `${form.auctionStartedAt} to ${form.auctionEndedAt}`
          : "",
      icon: CalendarDays,
    },
    {
      label: "Registration",
      done: Boolean(form?.showRegistrationForm),
      value: form?.showRegistrationForm ? "Enabled" : "Optional",
      icon: Users,
    },
  ];
  const completedSetup = setupChecklist.filter((item) => item.done).length;

  

  useEffect(() => {
    dispatch(getMyTournaments());
  }, []);

  const validateForm = () => {
    if (!form.tournamentId) {
      toast.error("Please select a Tournament");
      return false;
    }

    if (!form.auctionName.trim()) {
      toast.error("Auction name is required");
      return false;
    }

    if (!form.auctionStartedAt) {
      toast.error("Auction start date is required");
      return false;
    }

    if (!form.auctionEndedAt) {
      toast.error("Auction end date is required");
      return false;
    }

    if (form.auctionStartedAt > form.auctionEndedAt) {
      toast.error("End date cannot be before start date");
      return false;
    }

    // Trial validation
    if (form.trailTypeAuction) {
      if (!form.trailStart || !form.trailEnd) {
        toast.error("Trial start and end dates are required");
        return false;
      }
    }

    // Registration fee validation
    if (form.showRegistrationForm && form.playerRegistrationPaid) {
      if (form.feeType === "roleBased") {
        const missingRoleFee = Object.values(form.roleBasedFees || {}).some(
          (fee) => fee === "" || fee === null || fee === undefined,
        );
        if (missingRoleFee) {
          toast.error("All role based registration fees are required");
          return false;
        }
      } else if (!form.registrationFee) {
        toast.error("Registration fee is required");
        return false;
      }
      if (form.gstEnabled && !form.gstPercentage) {
        toast.error("GST percentage is required");
        return false;
      }
    }

    return true;
  };


  const handleCreateAuction = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(createAuction(form));

      toast.success("Auction created successfully!");

      navigate("/auction?tab=my");

      setForm(initialForm);
    } catch (error) {
      console.error("Error creating Auction:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleEditAuction = async () => {
    if (!validateForm()) return;
    try {
      let payload = {
        ...form,

        registrationFee: Number(form.registrationFee || 0),

        roleBasedFees: {
          batsman: Number(form.roleBasedFees?.batsman || 0),
          bowler: Number(form.roleBasedFees?.bowler || 0),
          allRounder: Number(form.roleBasedFees?.allRounder || 0),
          wicketKeeper: Number(form.roleBasedFees?.wicketKeeper || 0),
        },

        platformFee: Number(form.platformFee || 0),
        gstPercentage: Number(form.gstPercentage || 0),
      };

      if (payload?.auctionType === "manual") {
        payload.autoSettings = {
          playerDisplayDuration: "",
          bidIncrementInterval: "",
          autoBidIncrementAmount: "",
          countdownWarningAt: "",
          extendTimeOnBid: "",
        };
      }
      await dispatch(editAuction(auctionId, payload));
      toast.success("Auction edited successfully!");
      navigate(`/auction-details/${auctionId}`);
      setForm(initialForm);
    } catch (error) {
      console.error("Error editing Auction:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-[var(--font-primary)]">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <div className="px-3 py-4 sm:px-4 lg:px-6">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          {/* HEADER */}
          <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                  <Gavel className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Auction Setup
                  </p>
                  <h2 className="mt-1 font-[var(--font-heading)] text-xl font-bold leading-7 text-[var(--text-primary)] sm:text-2xl">
                    {auctionId ? "Edit Auction" : "Create Auction"}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                    Fill the essentials first. Advanced settings are collapsed
                    below and can be opened when needed.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:items-center">
                <span className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 font-semibold text-[var(--text-secondary)]">
                  {form?.auctionType === "auto" ? "Auto Auction" : "Manual Auction"}
                </span>
                <span className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 font-semibold text-[var(--text-secondary)]">
                  {form?.showRegistrationForm ? "Registration On" : "Registration Off"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <main className="space-y-4">

          {/* BASIC INFO */}
          <Section
            title="Basic Information"
            helper="Start here: tournament, name, and auction dates. Start and end dates can be the same for a one-day auction."
            defaultOpen
          >
            <Grid>

              <Select
                label="Tournament"
                value={form?.tournamentId}
                onChange={(v) => update("tournamentId", v)}
                options={myTournaments}
                loading={loading}
                placeholder="Select Tournament"
                tooltip="Choose the tournament this auction belongs to"
              />

              <Input
                label="Auction Name"
                value={form?.auctionName}
                placeholder="Enter auction name"
                onChange={(v) => update("auctionName", v)}
                tooltip="Give your auction a unique and descriptive name"
              />

              <Input
                type="date"
                label="Auction Start Date"
                value={form?.auctionStartedAt}
                onChange={(v) => update("auctionStartedAt", v)}
                tooltip="When will the auction begin?"
              />
              <Input
                type="date"
                label="Auction End Date"
                value={form?.auctionEndedAt}
                onChange={(v) => update("auctionEndedAt", v)}
                tooltip="When will the auction end? It can be the same as the start date for a one-day auction."
              />
              {/* <Select
                label="Auction Status"
                value={form?.auctionStatus}
                onChange={(v) => update("auctionStatus", v)}
                options={["scheduled", "ongoing"]}
              /> */}
            </Grid>
          </Section>

          {/* STREAM */}
          <Section
            title="Streaming (Optional)"
            helper="Add live stream details only when you need them."
          >
            <Grid>
              <Input
                label="Stream Key"
                placeholder="Enter RTMP/stream key"
                value={form?.streamKey}
                onChange={(v) => update("streamKey", v)}
                tooltip="Enter the RTMP or stream key for your live stream"
              />
              <Input
                label="Stream URL"
                placeholder="https://example.com/stream"
                value={form?.streamUrl}
                onChange={(v) => update("streamUrl", v)}
                tooltip="Enter the URL where your stream will be broadcasted"
              />
            </Grid>
          </Section>

          {/* TRIAL SETTINGS */}
          <Section
            title="Trial Auction"
            helper="Enable only if players need trial slots or sessions."
          >
            <Toggle
              label="Enable Trial Auction"
              checked={form?.trailTypeAuction}
              onChange={(v) => update("trailTypeAuction", v)}
              tooltip="Enable or disable the trial auction feature"
            />

            {form?.trailTypeAuction && (
              <>
                <Grid>
                  <Input
                    type="date"
                    label="Trial Start"
                    placeholder="Select trial start"
                    value={form?.trailStart}
                    onChange={(v) => update("trailStart", v)}
                    tooltip="Set the start date for the trials"
                  />
                  <Input
                    type="date"
                    label="Trial End"
                    placeholder="Select trial end"
                    value={form?.trailEnd}
                    onChange={(v) => update("trailEnd", v)}
                    tooltip="Set the end date for the trials"
                  />
                </Grid>

                <div className="mt-4">
                  <Toggle
                    label="Show Trial slots/sessions during player registration"
                    checked={form.showTrialLocations}
                    onChange={(v) => update("showTrialLocations", v)}
                    tooltip="Allow players to select trial slots or locations during registration when trial auction is enabled"
                  />
                </div>
              </>
            )}
          </Section>
          {/* <Section title="Player Registration Paid">
            <Toggle
              label="Enable Player Registration Fee"
              checked={form?.playerRegistrationPaid}
              onChange={(v) => update("playerRegistrationPaid", v)}
            />

            {form?.playerRegistrationPaid && (
              <Grid>
                <NumberInput
                  label="Registration Fee"
                  placeholder="e.g., 1000"
                  value={String(form?.registrationFee ?? "")}
                  onChange={(v) => update("registrationFee", v)}
                />
                <NumberInput
                  label="Plateform Fee"
                  placeholder="e.g., 10"
                  value={String(form?.platformFee ?? "")}
                  onChange={(v) => update("platformFee", v)}
                />
              </Grid>
            )}
          </Section> */}
          <Section
            title="Player Registration"
            helper="Control player registration form, fees, GST, and fields."
            defaultOpen
          >
            <Toggle
              label="Show Registration Form"
              checked={form.showRegistrationForm}
              onChange={(v) => update("showRegistrationForm", v)}
            />

            {form.showRegistrationForm && (
              <>
                <Toggle
                  label="Player Registration Paid"
                  checked={form.playerRegistrationPaid}
                  onChange={(v) => update("playerRegistrationPaid", v)}
                  tooltip="Require players to pay a registration fee to participate in the auction"
                />

                {form.playerRegistrationPaid && (
                  <Grid>
                    <Select
                      label="Fee Type"
                      value={form.feeType}
                      onChange={(v) => update("feeType", v)}
                      options={[
                        { label: "Default", value: "default" },
                        { label: "Role Based", value: "roleBased" },
                      ]}
                      tooltip="Choose one common fee or separate fees by player role"
                    />

                    {form.feeType === "default" ? (
                      <NumberInput
                        label="Registration Fee"
                        placeholder="e.g., 1000"
                        value={String(form.registrationFee ?? "")}
                        onChange={(v) => update("registrationFee", v)}
                        tooltip="Set the fee amount that players must pay to register for the auction"
                      />
                    ) : (
                      <>
                        <NumberInput
                          label="Batsman Fee"
                          placeholder="e.g., 1000"
                          value={String(form.roleBasedFees?.batsman ?? "")}
                          onChange={(v) =>
                            update("roleBasedFees", {
                              ...form.roleBasedFees,
                              batsman: v,
                            })
                          }
                        />
                        <NumberInput
                          label="Bowler Fee"
                          placeholder="e.g., 1000"
                          value={String(form.roleBasedFees?.bowler ?? "")}
                          onChange={(v) =>
                            update("roleBasedFees", {
                              ...form.roleBasedFees,
                              bowler: v,
                            })
                          }
                        />
                        <NumberInput
                          label="All Rounder Fee"
                          placeholder="e.g., 1000"
                          value={String(form.roleBasedFees?.allRounder ?? "")}
                          onChange={(v) =>
                            update("roleBasedFees", {
                              ...form.roleBasedFees,
                              allRounder: v,
                            })
                          }
                        />
                        <NumberInput
                          label="Wicket Keeper Fee"
                          placeholder="e.g., 1000"
                          value={String(form.roleBasedFees?.wicketKeeper ?? "")}
                          onChange={(v) =>
                            update("roleBasedFees", {
                              ...form.roleBasedFees,
                              wicketKeeper: v,
                            })
                          }
                        />
                      </>
                    )}

                    <NumberInput
                      label="Platform Fee"
                      placeholder="e.g., 10"
                      value={String(form.platformFee ?? "")}
                      onChange={(v) => update("platformFee", v)}
                    // tooltip="Set the percentage fee that the platform will take from the registration fee"
                    />
                    {/* GST Toggle */}
                    <Toggle
                      label="GST Enabled"
                      checked={form.gstEnabled}
                      onChange={(v) => update("gstEnabled", v)}
                      tooltip="Enable this if GST should be applied to the registration fee"
                    />

                    {/* GST Percentage Field */}
                    {form.gstEnabled && (
                      <NumberInput
                        label="GST Percentage (%)"
                        placeholder="e.g., 18.5"
                        value={String(form.gstPercentage ?? "")}
                        onChange={(v) => update("gstPercentage", v)}
                        tooltip="Set the GST percentage to be applied to the registration fee"
                        allowDecimal
                      />
                    )}
                  </Grid>
                )}

                {/* Player Registration Fields Configuration */}
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                    Player Registration Fields
                  </h4>
                  <div className="grid grid-cols-1 gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { key: 'profilePicture', label: 'Profile Picture' },
                      { key: 'name', label: 'Name' },
                      { key: 'role', label: 'Role' },
                      { key: 'mobileNumber', label: 'Mobile Number' },
                      { key: 'location', label: 'Location' },
                      { key: 'email', label: 'Email' },
                      { key: 'dateOfBirth', label: 'Date of Birth' },
                      { key: 'gender', label: 'Gender' },
                      { key: 'jerseyNumber', label: 'Jersey Number' },
                      { key: 'jerseyName', label: 'Jersey Name' },
                      { key: 'jerseySize', label: 'Jersey Size' },
                      { key: 'lowerSize', label: 'Lower Size' },
                      { key: 'adharCard', label: 'Aadhar Card' },
                      { key: 'voterId', label: 'Voter ID' },
                    ].map((field) => (
                      <label
                        key={field.key}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                      >
                        <input
                          type="checkbox"
                          checked={form.playerRegistrationFiels?.[field.key] || false}
                          onChange={(e) =>
                            update("playerRegistrationFiels", {
                              ...form.playerRegistrationFiels,
                              [field.key]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-[var(--border-primary)] accent-[var(--secondary)]"
                        />
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {field.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Section>

          {/* TEAM REGISTRATION */}
          <Section
            title="Team Registration"
            helper="Optional team registration settings and payment rules."
          >
            <Toggle
              label="Show Team Registration"
              checked={form.teamRegistration?.showTeamRegistration}
              onChange={(v) =>
                update("teamRegistration", {
                  ...form.teamRegistration,
                  showTeamRegistration: v,
                })
              }
              tooltip="Allow teams to register for this auction"
            />

            {form.teamRegistration?.showTeamRegistration && (
              <>
                <Toggle
                  label="Team Registration Paid"
                  checked={form.teamRegistration?.teamRegistrationPaid}
                  onChange={(v) =>
                    update("teamRegistration", {
                      ...form.teamRegistration,
                      teamRegistrationPaid: v,
                    })
                  }
                  tooltip="Require teams to pay a registration fee to join the auction"
                />

                {form.teamRegistration?.teamRegistrationPaid && (
                  <Grid>
                    <NumberInput
                      label="Team Registration Fee"
                      placeholder="e.g., 2000"
                      value={String(form.teamRegistration?.teamRegistrationFee ?? "")}
                      onChange={(v) =>
                        update("teamRegistration", {
                          ...form.teamRegistration,
                          teamRegistrationFee: v,
                        })
                      }
                      tooltip="Set the fee amount that teams must pay to register"
                    />

                    <NumberInput
                      label="Platform Fee"
                      placeholder="e.g., 10"
                      value={String(form.teamRegistration?.teamPlatformFee ?? "")}
                      onChange={(v) =>
                        update("teamRegistration", {
                          ...form.teamRegistration,
                          teamPlatformFee: v,
                        })
                      }
                      tooltip="Platform fee charged on team registration"
                    />

                    <div className="md:col-span-2">
                      <Toggle
                        label="GST Enabled"
                        checked={form.teamRegistration?.teamGstEnabled}
                        onChange={(v) =>
                          update("teamRegistration", {
                            ...form.teamRegistration,
                            teamGstEnabled: v,
                          })
                        }
                        tooltip="Apply GST on the team registration fee"
                      />
                    </div>

                    {form.teamRegistration?.teamGstEnabled && (
                      <NumberInput
                        label="GST Percentage (%)"
                        placeholder="e.g., 18.5"
                        value={String(form.teamRegistration?.teamGstPercentage ?? "")}
                        onChange={(v) =>
                          update("teamRegistration", {
                            ...form.teamRegistration,
                            teamGstPercentage: v,
                          })
                        }
                        tooltip="GST percentage applied to the team registration fee"
                        allowDecimal
                      />
                    )}
                  </Grid>
                )}
              </>
            )}
          </Section>

          {/* AUCTION RULES */}
          {!auctionId && (
            <Section
              title="Auction Rules"
              helper="Advanced squad, budget, RTM, and bidding limits."
            >
              <Grid>
                <NumberInput
                  label="Team Budget Cap"
                  placeholder="e.g., 100000"
                  value={String(form?.auctionRules?.budgetCap ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      budgetCap: v,
                    })
                  }
                  tooltip="Set the maximum budget that each team has for bidding on players"
                />

                <NumberInput
                  label="Max Players / Team"
                  placeholder="e.g., 25"
                  value={String(form?.auctionRules?.maxPlayersPerTeam ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      maxPlayersPerTeam: v,
                    })
                  }
                  tooltip="Set the maximum number of players that each team can have in their squad"
                />

                <NumberInput
                  label="Min Players / Team"
                  placeholder="e.g., 18"
                  value={String(form?.auctionRules?.minPlayersPerTeam ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      minPlayersPerTeam: v,
                    })
                  }
                  tooltip="Set the minimum number of players that each team must have in their squad"
                />

                <NumberInput
                  label="Max Foreign Players"
                  placeholder="e.g., 8"
                  value={String(form?.auctionRules?.maxForeignPlayers ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      maxForeignPlayers: v,
                    })
                  }
                  tooltip="Set the maximum number of foreign players allowed in each team"
                />

                <NumberInput
                  label="Max Wicket Keepers"
                  placeholder="e.g., 2"
                  value={String(form?.auctionRules?.maxWicketKeepers ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      maxWicketKeepers: v,
                    })
                  }
                  tooltip="Set the maximum number of wicket keepers allowed in each team"
                />

                <NumberInput
                  label="Min Wicket Keepers"
                  placeholder="e.g., 1"
                  value={String(form?.auctionRules?.minWicketKeepers ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      minWicketKeepers: v,
                    })
                  }
                  tooltip="Set the minimum number of wicket keepers required in each team"
                />

                <NumberInput
                  label="Base Price / Minimum Bid(Default)"
                  placeholder="e.g., 100"
                  value={String(form?.auctionRules?.minimumBid ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      minimumBid: v,
                    })
                  }
                  tooltip="Set the minimum bid amount for the auction"
                />

                <NumberInput
                  label="Bidding Increment(Default)"
                  placeholder="e.g., 1000"
                  value={String(form?.auctionRules?.biddingIncrement ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      biddingIncrement: v,
                    })
                  }
                  tooltip="Set the minimum increment amount for each new bid during the auction"
                />

                <NumberInput
                  label="Max Price Increment(Default)"
                  placeholder="e.g., 5000"
                  value={String(form?.auctionRules?.highPriceIncrement ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      highPriceIncrement: v,
                    })
                  }
                  tooltip="Set a higher increment amount that applies when the current bid exceeds a certain price threshold"
                />

                <NumberInput
                  label="Max RTM Cards / Team"
                  placeholder="e.g., 1"
                  value={String(form?.auctionRules?.maxRTMCardsPerTeam ?? "")}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      maxRTMCardsPerTeam: v,
                    })
                  }
                  tooltip="Set the maximum number of Right to Match (RTM) cards that each team can use during the auction"
                />

                <Toggle
                  label="RTM Enabled"
                  checked={form?.auctionRules?.rtmEnabled}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      rtmEnabled: v,
                    })
                  }
                  tooltip="Right to Match (RTM) allows teams to retain players by matching the highest bid during the auction. When enabled, teams can use RTM cards to bring back their previous players by matching the final bid amount."
                />

                <Toggle
                  label="Unsold Player Re-Entry"
                  checked={form?.auctionRules?.unsoldPlayerReEntry}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      unsoldPlayerReEntry: v,
                    })
                  }
                  tooltip="Allow unsold players to re-enter the auction in subsequent rounds if they remain unsold in the initial round"
                />

                <NumberInput
                  label="Accelerated Round After (Players)"
                  placeholder="e.g., 60"
                  value={String(
                    form?.auctionRules?.acceleratedRoundAfter ?? "",
                  )}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      acceleratedRoundAfter: v,
                    })
                  }
                />

                <NumberInput
                  label="Max Retain Players / Team"
                  placeholder="e.g., 0"
                  value={String(
                    form?.auctionRules?.maxReturnPlayersPerTeam ?? "",
                  )}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      maxReturnPlayersPerTeam: v,
                    })
                  }
                  tooltip="Set the maximum number of players that teams can retain from their previous squad before the auction starts"
                />

                <NumberInput
                  label="Max Purchase Players / Team"
                  placeholder="e.g., 0"
                  value={String(
                    form?.auctionRules?.maxPurchasePlayersPerTeam ?? "",
                  )}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      maxPurchasePlayersPerTeam: v,
                    })
                  }
                  tooltip="Set the maximum number of players that teams can purchase during the auction"
                />

                <NumberInput
                  label="Min Purchase Players / Team"
                  placeholder="e.g., 0"
                  value={String(
                    form?.auctionRules?.minPurchasePlayersPerTeam ?? "",
                  )}
                  onChange={(v) =>
                    update("auctionRules", {
                      ...form.auctionRules,
                      minPurchasePlayersPerTeam: v,
                    })
                  }
                  tooltip="Set the minimum number of players that teams must purchase during the auction"
                />
              </Grid>
            </Section>
          )}

          {
            <Section
              title="Public Visibility"
              helper="Choose what visitors can see publicly."
              defaultOpen
            >
            <Grid>
              <Toggle
                label="Show Auction Teams Publically"
                checked={form?.teamPublic}
                onChange={(v) => update("teamPublic", v)}
                tooltip="Control whether the teams participating in the auction are visible to the public"
              />

              <Toggle
                label="Show Auction Players Publically"
                checked={form?.playerPublic}
                onChange={(v) => update("playerPublic", v)}
                tooltip="Control whether the players participating in the auction are visible to the public"
              />
            </Grid>
            </Section>
          }

          {/* AUCTION TYPE */}
          <Section
            title="Auction Type"
            helper="Choose manual bidding or auto auction flow."
            defaultOpen
          >
            <RadioGroup
              value={form?.auctionType}
              onChange={(v) => update("auctionType", v)}
              options={[
                { label: "Manual", value: "manual" },
                { label: "Auto", value: "auto" },
              ]}
            />
          </Section>

          {/* AUTO SETTINGS */}
          {form?.auctionType === "auto" && (
            <Section
              title="Auto Auction Settings"
              helper="Timing and bid automation settings."
              defaultOpen
            >
              <Grid>
                <NumberInput
                  label="Player Display Duration (sec)"
                  placeholder="e.g., 30"
                  value={String(
                    form?.autoSettings?.playerDisplayDuration ?? "",
                  )}
                  onChange={(v) =>
                    update("autoSettings", {
                      ...form.autoSettings,
                      playerDisplayDuration: v,
                    })
                  }
                  tooltip="Set the duration for which each player is displayed during the auto auction"
                />
                <NumberInput
                  label="Bid Increment Interval (sec)"
                  placeholder="e.g., 2"
                  value={String(form?.autoSettings?.bidIncrementInterval ?? "")}
                  onChange={(v) =>
                    update("autoSettings", {
                      ...form.autoSettings,
                      bidIncrementInterval: v,
                    })
                  }
                  tooltip="Set the time interval between each bid increment during the auto auction"
                />
                <NumberInput
                  label="Auto Bid Increment Amount"
                  placeholder="e.g., 10000"
                  value={String(
                    form?.autoSettings?.autoBidIncrementAmount ?? "",
                  )}
                  onChange={(v) =>
                    update("autoSettings", {
                      ...form.autoSettings,
                      autoBidIncrementAmount: v,
                    })
                  }
                  tooltip="Set the fixed amount by which the bid will automatically increase at each increment during the auto auction"
                />
                <NumberInput
                  label="Countdown Warning At (sec)"
                  placeholder="e.g., 10"
                  value={String(form?.autoSettings?.countdownWarningAt ?? "")}
                  onChange={(v) =>
                    update("autoSettings", {
                      ...form.autoSettings,
                      countdownWarningAt: v,
                    })
                  }
                  tooltip="Set the time (in seconds) at which a warning will be triggered before the countdown ends for each player during the auto auction"
                />
                <NumberInput
                  label="Extend Time On Bid (sec)"
                  placeholder="e.g., 10"
                  value={String(form?.autoSettings?.extendTimeOnBid ?? "")}
                  onChange={(v) =>
                    update("autoSettings", {
                      ...form.autoSettings,
                      extendTimeOnBid: v,
                    })
                  }
                  tooltip="Set the amount of time (in seconds) that will be added to the countdown when a new bid is placed during the auto auction"
                />
              </Grid>
            </Section>
          )}

            </main>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-heading)] text-base font-bold text-[var(--text-primary)]">
                      Setup Checklist
                    </h3>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {completedSetup}/{setupChecklist.length} essentials ready
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--secondary-lighter)]">
                  <div
                    className="h-full rounded-full bg-[var(--secondary)] transition-all"
                    style={{
                      width: `${Math.round(
                        (completedSetup / setupChecklist.length) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {setupChecklist.map((item) => (
                    <SummaryItem
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                      done={item.done}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 text-sm shadow-[var(--shadow-card)]">
                <p className="font-semibold text-[var(--text-primary)]">
                  Recommended flow
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Complete basic information first, enable registration only if
                  required, then review auction type and visibility before
                  saving.
                </p>
              </div>
            </aside>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
          {!auctionId && (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
          )
}
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--secondary)] px-6 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)]"
              onClick={auctionId ? handleEditAuction : handleCreateAuction}
            >
              <CircleDollarSign className="h-4 w-4" />
              {auctionId ? " Edit Auction" : " Create Auction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
