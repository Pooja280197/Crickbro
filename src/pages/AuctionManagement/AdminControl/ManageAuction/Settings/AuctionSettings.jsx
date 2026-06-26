import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  addAuctionAdmin,
  addNewField,
  addTeamOwner,
  addTeamToAuction,
  fetchAllAdmin,
  fetchAllTeamOwners,
  fetchAuctionDetails,
  getAllAuctionTeam,
  removeAdmin,
  removeTeamOwner,
  searchUserByMobile,
} from "../../../../../redux/actions";
import {
  X,
  Phone,
  User,
  UserPlus,
  Users,
  Shield,
  Trophy,
  Settings as SettingsIcon,
  Barcode,
  UserCog,
  UserCheck,
  Edit,
  Settings,
  RotateCcw,
} from "lucide-react";
import Loader from "../../../../../components/Loader";
import { toast } from "react-toastify";
import EditAuctionRules from "./EditAuctionRules";
import Categories from "./CategoryTab/Categories";
import EntryBarcode from "./EntryBarcode";
import { useNavigate } from "react-router-dom";
import ChangeAuctionStatus from "./ChangeAuctionStatus";

const tabs = [
  { key: "barcode", label: "View Barcode", icon: Barcode },
  { key: "addAdmin", label: "Add Organizers", icon: UserCog },
  { key: "addOwner", label: "Add Team Owner", icon: UserCheck },
  { key: "category", label: "Lot category/Bid Slab", icon: SettingsIcon },
  { key: "rules", label: "Auction Rules", icon: SettingsIcon },
];

const panelClass =
  "overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const panelHeaderClass =
  "border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-3";
const iconTileClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]";
const fieldShellClass =
  "group flex h-11 items-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] transition focus-within:border-[var(--border-primary)] focus-within:bg-[var(--bg-card)] focus-within:ring-2 focus-within:ring-[var(--accent-light)]";
const inputIconClass =
  "flex h-full w-11 shrink-0 items-center justify-center rounded-l-lg border-r border-[var(--border-card)] bg-[var(--accent-light)] text-[var(--primary)] transition group-focus-within:border-[var(--border-primary)]";
const inputClass =
  "h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:text-[var(--text-secondary)]";
const selectClass =
  "h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[var(--text-primary)] outline-none";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]";
const listItemClass =
  "flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 transition hover:border-[var(--border-primary)] hover:bg-[var(--bg-card)]";
const avatarClass =
  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-sm font-bold uppercase text-[var(--primary)]";
const scrollClass =
  "professional-scrollbar max-h-[400px] overflow-y-auto p-4";

const AuctionSettings = ({ auctionId }) => {
  const [activeTab, setActiveTab] = useState("addAdmin");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [sendAdminId, setSendAdminId] = useState(null);
  const [searchAuctionTeam, setSearchAuctionTeam] = useState("");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [addName, setAddName] = useState("");
   const [showStatusModal, setShowStatusModal] = useState(false);

  const dispatch = useDispatch();

  const isAdminLoading = useSelector((state) => state.loading?.auctionAdmins);
  const isTeamOwnersLoading = useSelector(
    (state) => state.loading?.auctionTeamOwners,
  );
  const isTeamsLoading = useSelector((state) => state.loading?.allAuctionTeams);
  const isRatingFieldsLoading = useSelector(
    (state) => state.loading?.ratingFieldsList,
  );

  const adminData = useSelector((state) => state.data?.auctionAdmins || null);
  const teamOwnersData = useSelector(
    (state) => state.data?.auctionTeamOwners || null,
  );
  const tournamentTeam = useSelector(
    (state) => state.data?.allAuctionTeams || null,
  );

  const auction = useSelector((state) => state.data?.auctionDetails || null);
  const searchUser = useSelector((state) => state.data?.searchUser || null);
  const adminList = adminData?.admins || [];
  const ownerList = teamOwnersData?.data || [];
  const tournamentId = useSelector((state) => state.tournamentId);

  useEffect(() => {
    if (activeTab === "addAdmin" || activeTab === "addOwner") {
      setName("");
      setContact("");
      setSendAdminId(null);
      setAddName(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!auctionId) return;

    if (!auction) {
      dispatch(fetchAuctionDetails(auctionId));
    }
    if (!adminData) {
      dispatch(fetchAllAdmin(auctionId));
    }
    if (!teamOwnersData) {
      dispatch(fetchAllTeamOwners(auctionId));
    }
    if (!tournamentTeam) {
      dispatch(getAllAuctionTeam(tournamentId));
    }
  }, [auctionId]);

  useEffect(() => {
    if (tournamentTeam?.length > 0) {
      const alreadySelected = tournamentTeam
        .filter((item) => item?.auctionTeam === true)
        .map((item) => item?.teamId?._id);

      setSelectedTeam(alreadySelected);
    }
  }, [tournamentTeam]);

  const handleContactChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setContact(value);
    }
    if (value.length === 10) {
      try {
        const res = await dispatch(searchUserByMobile(value));

        if (res?.data?.data) {
          setName(res.data.data.name);
          setSendAdminId(res.data.data._id);
          setAddName(false);
        } else {
          setName("");
          setSendAdminId("");
          setAddName(true);
        }
      } catch (err) {
        console.error(err);
        setName("");
        setSendAdminId("");
        setAddName(true);
      }
    } else {
      setSendAdminId("");
      setName("");
      setAddName(true);
    }
  };

  const handleAddAdmin = async () => {
    const payload = sendAdminId ? sendAdminId : { mobile: contact, name: name };
    if (contact.length !== 10) {
      toast.error("Enter valid 10 digit mobile number");
      return;
    }
    if (!name.trim()) {
      toast.error("Admin name is Required");
      return;
    }

    try {
      const res = await dispatch(addAuctionAdmin(auctionId, payload));

      if (res?.data) {
        toast.success("Admin Added!");
        dispatch(fetchAllAdmin(auctionId));
        setSendAdminId(null);
        setContact("");
        setName("");
        setAddName(false);
      }
    } catch (err) {
      toast.error("Admin already added or server error");
      console.log("Admin already added or server error", err);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      await dispatch(removeAdmin(auctionId, adminId));
      toast.success("Admin removed");
      dispatch(fetchAllAdmin(auctionId));
    } catch (err) {
      toast.error("Failed to remove admin");
      console.log("Error removing Admin", err);
    }
  };

  const handleAddTeamOwner = async () => {
    const payload = sendAdminId
      ? sendAdminId
      : { mobile: contact, name: name, teamId: selectedTeamId };
    if (!selectedTeamId) {
      toast.error("Please select a team");
      return;
    }
    if (contact.length !== 10) {
      toast.error("Enter valid 10 digit mobile number");
      return;
    }
    if (!name.trim()) {
      toast.error("Owner name is required");
      return;
    }
    try {
      await dispatch(addTeamOwner(auctionId, selectedTeamId, payload));
      toast.success("Team Owner Added!");
      setSelectedTeamId("");
      setSendAdminId(null);
      setContact("");
      setName("");
      setAddName(false);
      dispatch(fetchAllTeamOwners(auctionId));
    } catch (err) {
      toast.error("Owner already exists or server error");
      console.log("Error adding Team Owner", err);
    }
  };

  const handleRemoveTeamOwner = async (ownerId, teamId) => {
    try {
      await dispatch(removeTeamOwner(auctionId, ownerId, teamId));
      toast.success("Team Owner removed successfully");
      dispatch(fetchAllTeamOwners(auctionId));
    } catch (err) {
      toast.error("Failed to remove team owner");
      console.log("Error removing team owner", err);
    }
  };

  const visibleTabs = tabs;

  const getTeamName = (owner) =>
    owner?.team?.name ||
    owner?.teamId?.name ||
    owner?.teamName ||
    owner?.name ||
    "Team";

  const getTeamId = (owner) =>
    owner?.team?._id || owner?.teamId?._id || owner?.teamId || owner?._id || "";

  const getOwnerItems = (owner) => {
    if (Array.isArray(owner?.owners)) return owner.owners;
    if (Array.isArray(owner?.teamOwners)) return owner.teamOwners;
    if (Array.isArray(owner?.owner)) return owner.owner;

    const singleOwner =
      owner?.owner ||
      owner?.teamOwner ||
      owner?.user ||
      owner?.admin ||
      (owner?.ownerName || owner?.ownerMobile
        ? {
            _id: owner?.ownerId || owner?._id,
            name: owner?.ownerName,
            mobile: owner?.ownerMobile,
          }
        : null);

    return singleOwner ? [singleOwner] : [];
  };

  const renderAddTeamOwner = () => {
    if (isTeamOwnersLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader text="Loading Team Owners..." />
        </div>
      );
    }

    const ownerCount = ownerList.reduce(
      (total, owner) => total + getOwnerItems(owner).length,
      0,
    );

    // Add Team Owner Form Component
    const AddTeamOwnerForm = () => (
      <div className={panelClass}>
        <div className={panelHeaderClass}>
          <div className="flex items-center gap-3">
            <div className={iconTileClass}>
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Add New Team Owner
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Add team owners by phone number
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Team Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
              Select Team
            </label>
            <div className={fieldShellClass}>
              <div className={inputIconClass}>
                <Trophy className="h-4 w-4" />
              </div>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className={selectClass}
              >
                <option value="" className="bg-black text-[var(--text-primary)]">
                  -- Select a team --
                </option>
                {tournamentTeam?.map((item) => (
                  <option
                    key={item?.teamId?._id}
                    value={item?.teamId?._id}
                    className="bg-black text-[var(--text-primary)]"
                  >
                    {item?.teamId?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
              Phone Number
            </label>
            <div className={fieldShellClass}>
              <div className={inputIconClass}>
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                value={contact}
                onChange={handleContactChange}
                placeholder="Enter 10 digit mobile number"
                maxLength={10}
                className={inputClass}
              />
              {contact ? (
                <button
                  type="button"
                  onClick={() => {
                    setContact("");
                    setName("");
                    setSendAdminId(null);
                    setAddName(false);
                  }}
                  className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-secondary)] transition hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                  title="Clear"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
              Owner Name
            </label>
            <div className={fieldShellClass}>
              <div className={inputIconClass}>
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={name}
                disabled={sendAdminId && !addName}
                onChange={(e) => {
                  setName(e.target.value);
                  setAddName(true);
                  setSendAdminId("");
                }}
                placeholder={
                  sendAdminId
                    ? "Auto fetched name"
                    : "Type name or auto-fetched"
                }
                className={inputClass}
              />
            </div>
            {sendAdminId && !addName && (
              <p className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Auto-fetched
              </p>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddTeamOwner}
            className={`${primaryButtonClass} w-full`}
          >
            <UserPlus className="h-4 w-4" />
            Add Team Owner
          </button>
        </div>
      </div>
    );

    // Existing Team Owners List Component
    const ExistingTeamOwners = () => (
      <div className={panelClass}>
        <div className={panelHeaderClass}>
          <div className="flex items-center gap-3">
            <div className={iconTileClass}>
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Existing Team Owners
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {ownerCount} owner{ownerCount !== 1 ? "s" : ""} assigned
              </p>
            </div>
          </div>
        </div>

        <div className={scrollClass}>
          {ownerList.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] py-8 text-center text-sm text-[var(--text-secondary)]">
              No team owners added yet
            </p>
          ) : (
            <div className="space-y-3">
              {ownerList.map((owner) => {
                const teamName = getTeamName(owner);
                const teamId = getTeamId(owner);
                const owners = getOwnerItems(owner);

                return (
                <div key={owner?._id || teamId || teamName} className="space-y-2">
                  <div className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[var(--primary)]" />
                    <span className="truncate">{teamName}</span>
                  </div>
                  {owners.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-3 text-sm text-[var(--text-secondary)] sm:ml-6">
                      No owner assigned for this team
                    </div>
                  ) : owners.map((oname) => (
                    <div
                      key={oname?._id || oname?.mobile || oname?.name}
                      className={`${listItemClass} ml-0 sm:ml-6`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={avatarClass}>
                          {oname?.name?.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                            {oname?.name || oname?.ownerName || "Owner"}
                          </p>
                          {/* <p className="text-xs text-[var(--text-muted)]">
                            {oname?.mobile || oname?.phone || oname?._id
                              ? `ID: ${(oname?.mobile || oname?.phone || oname?._id)?.slice(-6)}`
                              : "Owner details"}
                          </p> */}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveTeamOwner(oname?._id, teamId)
                        }
                        className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 transition hover:bg-red-50"
                        title="Remove owner"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <>
        {/* Mobile/Tablet view - Stacked with Add form on top */}
        <div className="block lg:hidden space-y-6">
          {AddTeamOwnerForm()}
          {ExistingTeamOwners()}
        </div>

        {/* Desktop view - Side by side */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(340px,0.85fr)_minmax(500px,1.15fr)]">
          {AddTeamOwnerForm()}
          {ExistingTeamOwners()}
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "addAdmin":
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={panelClass}>
              <div className={panelHeaderClass}>
                <div className="flex items-center gap-3">
                  <div className={iconTileClass}>
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Add New Organizer
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Add organizers by phone number
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Phone Input */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Phone Number
                  </label>
                  <div className={fieldShellClass}>
                    <div className={inputIconClass}>
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      value={contact}
                      onChange={handleContactChange}
                      placeholder="Enter 10 digit mobile number"
                      maxLength={10}
                      className={inputClass}
                    />
                    {contact ? (
                      <button
                        type="button"
                        onClick={() => {
                          setContact("");
                          setName("");
                          setSendAdminId(null);
                          setAddName(false);
                        }}
                        className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-secondary)] transition hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                        title="Clear"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Organizer Name
                  </label>
                  <div className={fieldShellClass}>
                    <div className={inputIconClass}>
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      disabled={sendAdminId && !addName}
                      onChange={(e) => {
                        setName(e.target.value);
                        setAddName(true);
                        setSendAdminId("");
                      }}
                      placeholder={
                        sendAdminId
                          ? "Auto fetched name"
                          : "Type name or auto-fetched"
                      }
                      className={inputClass}
                    />
                  </div>
                  {sendAdminId && !addName && (
                    <p className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Auto-fetched
                    </p>
                  )}
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddAdmin}
                  className={`${primaryButtonClass} w-full`}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Organizer
                </button>
              </div>
            </div>

            <div className={panelClass}>
              <div className={panelHeaderClass}>
                <div className="flex items-center gap-3">
                  <div className={iconTileClass}>
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Existing Organizers
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      {adminList.length} organizer{adminList.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                </div>
              </div>

              <div className={scrollClass}>
                {adminList.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] py-8 text-center text-sm text-[var(--text-secondary)]">
                    No organizers added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {adminList.map((admin) => (
                      <div
                        key={admin._id}
                        className={listItemClass}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={avatarClass}>
                            {admin?.name?.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                              {admin.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAdmin(admin._id)}
                          className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 transition hover:bg-red-50"
                          title="Remove organizer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "addOwner":
        return renderAddTeamOwner();

      case "category":
        return <Categories auctionId={auctionId} />;

      case "rules":
        return (
          <EditAuctionRules
            currentRules={auction?.auctionRules}
            auctionId={auctionId}
          />
        );

      case "barcode":
        return (
          <EntryBarcode
            tournamentId={tournamentId}
            auctionId={auctionId}
            tournamentName={auction?.tournament?.name}
            city={auction?.tournament?.city}
          />
        );

      default:
        return null;
    }
  };

  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full space-y-4 p-3 text-[var(--text-primary)] sm:p-4 lg:p-5 bg-[var(--bg-main)]">
      {/* Header Section */}
      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className={iconTileClass}>
              <SettingsIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-[var(--text-primary)] sm:text-xl">
                Auction Settings
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Manage organizers, team owners, categories, barcode and auction rules.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className={primaryButtonClass}
              onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/editAuction/${auctionId}`);
                }}
            >
              <Edit className="h-4 w-4" />
              Edit Auction
            </button>
            <button
              className={outlineButtonClass}
              onClick={() => setShowStatusModal(true)}
            >
              <Settings className="h-4 w-4 text-[var(--primary)]" />
              Update Auction Status
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Made responsive */}
      <div className="overflow-x-auto scrollbar-hide rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2 shadow-[var(--shadow-card)]">
        <div className="flex min-w-max items-center gap-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[var(--border-primary)] bg-[var(--secondary)] text-[#102033] shadow-sm"
                    : "border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-card)] hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
       <ChangeAuctionStatus
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        auctionId={auctionId}
        onSuccess={(newStatus) => {
          console.log("Updated to:", newStatus);
          // refresh auction details if needed
        }}
        auctionStatus={auction?.auctionStatus}
      />
    </div>
  );
};

export default AuctionSettings;
