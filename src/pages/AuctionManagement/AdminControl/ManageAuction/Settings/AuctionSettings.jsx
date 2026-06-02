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
  { key: "rules", label: "Edit Auction Rules", icon: SettingsIcon },
];

const AuctionSettings = ({ auctionId }) => {
  const [activeTab, setActiveTab] = useState("addAdmin");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [sendAdminId, setSendAdminId] = useState(null);
  const [searchAuctionTeam, setSearchAuctionTeam] = useState("");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState();
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
        }
      } catch (err) {
        console.error(err);
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
      setSelectedTeamId(null);
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


  const renderAddTeamOwner = () => {
    if (isTeamOwnersLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader text="Loading Team Owners..." />
        </div>
      );
    }

    // Add Team Owner Form Component
    const AddTeamOwnerForm = () => (
      <div className="border rounded-lg bg-gray-50">
        <div className="border-b px-4 py-3 bg-white rounded-t-lg">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add New Team Owner
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Add team owners by phone number
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team
            </label>
            <div className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-transparent text-gray-800 outline-none text-sm cursor-pointer"
              >
                <option value="" className="bg-white text-gray-800">
                  -- Select a team --
                </option>
                {tournamentTeam?.map((item) => (
                  <option
                    key={item?.teamId?._id}
                    value={item?.teamId?._id}
                    className="bg-white text-gray-800"
                  >
                    {item?.teamId?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
              <span className="text-gray-400 text-sm">📱</span>
              <input
                type="tel"
                value={contact}
                onChange={handleContactChange}
                placeholder="Enter 10 digit mobile number"
                maxLength={10}
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
              <span className="text-gray-400 text-sm">👤</span>
              <input
                type="text"
                value={name}
                disabled={!addName && !sendAdminId}
                onChange={(e) => {
                  setName(e.target.value);
                  setAddName(true);
                }}
                placeholder={
                  sendAdminId
                    ? "Auto fetched name"
                    : "Type name or auto-fetched"
                }
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            {sendAdminId && !addName && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Name auto-fetched from registered user
              </p>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddTeamOwner}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Team Owner
          </button>
        </div>
      </div>
    );

    // Existing Team Owners List Component
    const ExistingTeamOwners = () => (
      <div className="border rounded-lg bg-gray-50">
        <div className="border-b px-4 py-3 bg-white rounded-t-lg">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Existing Team Owners
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {ownerList.length} team owner{ownerList.length !== 1 ? "s" : ""}{" "}
            assigned
          </p>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto">
          {ownerList.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              No team owners added yet
            </p>
          ) : (
            <div className="space-y-3">
              {ownerList.map((owner) => (
                <div key={owner?._id} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    {owner?.team?.name}
                  </div>
                  {owner?.owners?.map((oname) => (
                    <div
                      key={oname._id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow ml-6"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                          {oname?.name?.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {oname?.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {oname._id?.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveTeamOwner(oname._id, owner?.team?._id)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                        title="Remove owner"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <>
        {/* Mobile/Tablet view - Stacked with Add form on top */}
        <div className="block lg:hidden space-y-6">
          <AddTeamOwnerForm />
          <ExistingTeamOwners />
        </div>

        {/* Desktop view - Side by side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          <ExistingTeamOwners />
          <AddTeamOwnerForm />
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "addAdmin":
        return (
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="border rounded-lg bg-gray-50 w-full md:w-1/2">
              <div className="border-b px-4 py-3 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add New Organizer
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add organizers by phone number
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
                    <span className="text-gray-400 text-sm">📱</span>
                    <input
                      type="tel"
                      value={contact}
                      onChange={handleContactChange}
                      placeholder="Enter 10 digit mobile number"
                      maxLength={10}
                      className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organizer Name
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
                    <span className="text-gray-400 text-sm">👤</span>
                    <input
                      type="text"
                      value={name}
                      disabled={!addName && !sendAdminId}
                      onChange={(e) => {
                        setName(e.target.value);
                        setAddName(true);
                      }}
                      placeholder={
                        sendAdminId
                          ? "Auto fetched name"
                          : "Type name or auto-fetched"
                      }
                      className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  {sendAdminId && !addName && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Name auto-fetched from registered user
                    </p>
                  )}
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddAdmin}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Organizer
                </button>
              </div>
            </div>

            <div className="border rounded-lg bg-gray-50 w-full md:w-1/2">
              <div className="border-b px-4 py-3 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Existing Organizers
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {adminList.length} organizer
                  {adminList.length !== 1 ? "s" : ""} added
                </p>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto">
                {adminList.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    No organizers added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {adminList.map((admin) => (
                      <div
                        key={admin._id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                            {admin?.name?.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {admin.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAdmin(admin._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                          title="Remove organizer"
                        >
                          <X className="w-4 h-4" />
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
        return (
          <div className="flex flex-col w-full md:flex-row gap-6">
            <div className="border rounded-lg bg-gray-50 w-full md:w-1/2">
              <div className="border-b px-4 py-3 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add New Team Owner
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add team owners by phone number
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* Team Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Team
                  </label>
                  <div className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full bg-transparent text-gray-800 outline-none text-sm cursor-pointer"
                    >
                      <option value="" className="bg-white text-gray-800">
                        -- Select a team --
                      </option>
                      {tournamentTeam?.map((item) => (
                        <option
                          key={item?.teamId?._id}
                          value={item?.teamId?._id}
                          className="bg-white text-gray-800"
                        >
                          {item?.teamId?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
                    <span className="text-gray-400 text-sm">📱</span>
                    <input
                      type="tel"
                      value={contact}
                      onChange={handleContactChange}
                      placeholder="Enter 10 digit mobile number"
                      maxLength={10}
                      className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
                    <span className="text-gray-400 text-sm">👤</span>
                    <input
                      type="text"
                      value={name}
                      disabled={!addName && !sendAdminId}
                      onChange={(e) => {
                        setName(e.target.value);
                        setAddName(true);
                      }}
                      placeholder={
                        sendAdminId
                          ? "Auto fetched name"
                          : "Type name or auto-fetched"
                      }
                      className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  {sendAdminId && !addName && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Name auto-fetched from registered user
                    </p>
                  )}
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddTeamOwner}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Team Owner
                </button>
              </div>
            </div>
            <div className="border rounded-lg bg-gray-50 w-full md:w-1/2">
              <div className="border-b px-4 py-3 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Existing Team Owners
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {ownerList.length} team owner
                  {ownerList.length !== 1 ? "s" : ""} assigned
                </p>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto">
                {ownerList.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    No team owners added yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ownerList.map((owner) => (
                      <div key={owner?._id} className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          {owner?.team?.name}
                        </div>
                        {owner?.owners?.map((oname) => (
                          <div
                            key={oname._id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow ml-6"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                                {oname?.name?.substring(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm truncate">
                                  {oname?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ID: {oname._id?.slice(-6)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveTeamOwner(
                                  oname._id,
                                  owner?.team?._id,
                                )
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                              title="Remove owner"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

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

  const navigate =useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Auction Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage organizers, team owners and auction rules
          </p>
        </div>
        <div className="flex flex-row">
          <button className="flex bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
          onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/editAuction/${auctionId}`);
                }}>
            <Edit className="w-5 h-5 text-white" />
            <span className="ml-1 text-sm text-white">Edit Auction</span>
          </button>
          <button className="ml-3 flex bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
           onClick={() => setShowStatusModal(true)}>
            <Settings className="w-5 h-5 text-gray-800" />
            <span className="ml-1 text-sm">Update Auction Status</span>
          </button>
        </div>
      </div>

      {/* Tabs - Made responsive */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 min-w-max py-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group relative flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-md
${
  isActive
    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_10px_30px_rgba(124,58,237,0.35)] scale-[1.02]"
    : "bg-white/80 text-gray-600 border border-white shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:text-purple-600"
}`}
              >
                {/* Active Glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-purple-500/10 blur-xl" />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label */}
                <span className="relative z-10">{tab.label}</span>

                {/* Active Dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg">{renderContent()}</div>
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
