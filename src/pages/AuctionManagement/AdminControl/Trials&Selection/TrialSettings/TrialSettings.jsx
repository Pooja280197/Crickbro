import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  addAuctionSelector,
  addNewField,
  fetchAllSelectors,
  fetchAuctionDetails,
  getAuctionRatingFields,
  removeSelector,
  searchUserByMobile,
} from "../../../../../redux/actions";
import {
  X,
  UserPlus,
  Users,
  Star,
  Settings as SettingsIcon,
  Phone,
  User,
  Plus,
  Trash2,
  Search,
  RotateCcw,
  Save,
} from "lucide-react";
import Loader from "../../../../../components/Loader";
import RatingInput from "../../../../../components/RatingInput";
import { toast } from "react-toastify";
import Rating from "./Rating";

const tabs = [
  { key: "addSelectors", label: "Add Selector", icon: UserPlus },
  { key: "rating", label: "Rating", icon: Star },
  { key: "addFields", label: "Fields", icon: SettingsIcon },
];

const panelClass =
  "overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]";
const panelHeaderClass =
  "border-b border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3";
const fieldClass =
  "h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]";
const selectClass =
  "h-10 w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]";
const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--secondary)] px-4 text-sm font-semibold text-[#102033] shadow-sm transition hover:bg-[var(--secondary-strong)] disabled:cursor-not-allowed disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50";

const Settings = ({ auctionId, isTrialType }) => {
  const [activeTab, setActiveTab] = useState("addSelectors");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [sendAdminId, setSendAdminId] = useState(null);
  const [fields, setFields] = useState([]);
  const [addName, setAddName] = useState("");
  const [ratingSearch, setRatingSearch] = useState("");
  const [ratingFieldType, setRatingFieldType] = useState("");
  const [ratingType, setRatingType] = useState("");
  const [ratingAppliesTo, setRatingAppliesTo] = useState("");
  const [ratingHasOptions, setRatingHasOptions] = useState("");
  const [ratingPage, setRatingPage] = useState(1);

  const dispatch = useDispatch();

  const isSelectorLoading = useSelector(
    (state) => state.loading?.auctionSelectors,
  );

  const selectorsData = useSelector(
    (state) => state.data?.auctionSelectors || null,
  );

  const auction = useSelector((state) => state.data?.auctionDetails || null);
  const searchUser = useSelector((state) => state.data?.searchUser || null);
  const selectorList = selectorsData?.selectors || [];
  const ratingFields = auction?.ratingField || [];
  const isRatingFieldsLoading = useSelector(
    (state) => state.loading?.ratingFieldsList,
  );
  const ratingFieldsListData = useSelector(
    (state) => state.data?.ratingFieldsList,
  );
  const filteredRatingFields = ratingFieldsListData?.list || [];
  const filteredRatingFieldsPage = ratingFieldsListData?.page || 1;
  const filteredRatingFieldsPages = ratingFieldsListData?.pages || 1;
  const filteredRatingFieldsTotal = ratingFieldsListData?.total || 0;
  const tournamentId = useSelector((state) => state.tournamentId);

  useEffect(() => {
    if (activeTab === "addSelectors") {
      setName("");
      setContact("");
    }
  }, [activeTab]);

  useEffect(() => {
    setFields(
      ratingFields.map((field) => ({
        id: field._id,
        label: field.label,
        fieldType: field.fieldType || "input",
        type: field.type || "string",
        appliesTo: field.appliesTo || "all",
        optionsList: Array.isArray(field.options)
          ? field.options.map((opt) => String(opt || ""))
          : [],
      })),
    );
  }, [ratingFields]);

  useEffect(() => {
    if (activeTab !== "addFields" || !auctionId) return;

    dispatch(
      getAuctionRatingFields({
        auctionId,
        page: ratingPage,
        limit: 10,
        search: ratingSearch,
        fieldType: ratingFieldType,
        type: ratingType,
        appliesTo: ratingAppliesTo,
        hasOptions: ratingHasOptions,
      }),
    );
  }, [
    activeTab,
    auctionId,
    ratingPage,
    ratingSearch,
    ratingFieldType,
    ratingType,
    ratingAppliesTo,
    ratingHasOptions,
    dispatch,
  ]);

  useEffect(() => {
    if (!auctionId) return;
    if (!auction) {
      dispatch(fetchAuctionDetails(auctionId));
    }
    if (!selectorsData) {
      dispatch(fetchAllSelectors(auctionId));
    }
  }, [auctionId]);

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

  const handleAddSelector = async () => {
    const payload = sendAdminId ? sendAdminId : { mobile: contact, name: name };
    if (contact.length !== 10) {
      toast.error("Enter valid 10 digit mobile number");
      return;
    }
    if (!name.trim()) {
      toast.error("Selector name is Required");
      return;
    }
    try {
      const res = await dispatch(addAuctionSelector(auctionId, payload));
      if (res?.data) {
        toast.success("Selector Added!");
        dispatch(fetchAllSelectors(auctionId));
        setSendAdminId(null);
        setContact("");
        setName("");
      }
    } catch (err) {
      toast.error("Selector already added or server error");
      console.log("Selector already added or server error", err);
    }
  };

  const handleRemoveSelector = async (selectorId) => {
    try {
      await dispatch(removeSelector(auctionId, selectorId));
      toast.success("Selector removed successfully");
      dispatch(fetchAllSelectors(auctionId));
    } catch (err) {
      toast.error("Failed to remove selector");
      console.log("Error removing selector", err);
    }
  };

  const visibleTabs = tabs;

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "",
        fieldType: "input",
        type: "string",
        appliesTo: "all",
        optionsList: [],
      },
    ]);
  };

  const handleChange = (id, key, value) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  };

  const handleFieldTypeChange = (id, value) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;

        const needsOptions =
          value === "dropdown" || value === "radio" || value === "checkbox";

        return {
          ...field,
          fieldType: value,
          optionsList: needsOptions
            ? field.optionsList && field.optionsList.length
              ? field.optionsList
              : [""]
            : [],
        };
      }),
    );
  };

  const handleAddOption = (id) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? {
              ...field,
              optionsList: [...(field.optionsList || []), ""],
            }
          : field,
      ),
    );
  };

  const handleOptionChange = (id, optionIndex, value) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;

        const nextOptions = [...(field.optionsList || [])];
        nextOptions[optionIndex] = value;

        return {
          ...field,
          optionsList: nextOptions,
        };
      }),
    );
  };

  const handleRemoveOption = (id, optionIndex) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;

        const nextOptions = (field.optionsList || []).filter(
          (_, idx) => idx !== optionIndex,
        );

        return {
          ...field,
          optionsList: nextOptions,
        };
      }),
    );
  };

  const handleDelete = (id) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleUpdate = async () => {
    try {
      // if (!fields.length) {
      //   toast.error("Please add at least one field");
      //   return;
      // }

      for (const field of fields) {
        if (!String(field?.label || "").trim()) {
          toast.error("Field label is required");
          return;
        }

        if (
          (field.fieldType === "dropdown" ||
            field.fieldType === "radio" ||
            field.fieldType === "checkbox") &&
          !(field.optionsList || []).some((opt) => String(opt || "").trim())
        ) {
          toast.error("Checkbox/Dropdown/Radio fields require options");
          return;
        }
      }

      const payload = {
        ratingFields: fields.map(
          ({ label, fieldType, type, appliesTo, optionsList }) => {
            const options = (optionsList || [])
              .map((opt) => opt.trim())
              .filter(Boolean);

            const normalizedFieldType = fieldType || "input";
            const normalizedType =
              normalizedFieldType === "input" ? type || "string" : "string";

            return {
              label: String(label || "").trim(),
              fieldType: normalizedFieldType,
              type: normalizedType,
              appliesTo: appliesTo || "all",
              options:
                normalizedFieldType === "dropdown" ||
                normalizedFieldType === "radio" ||
                normalizedFieldType === "checkbox"
                  ? options
                  : [],
            };
          },
        ),
      };

      await dispatch(addNewField(auctionId, payload));
      dispatch(fetchAuctionDetails(auctionId));
      setRatingPage(1);
      dispatch(
        getAuctionRatingFields({
          auctionId,
          page: 1,
          limit: 10,
          search: ratingSearch,
          fieldType: ratingFieldType,
          type: ratingType,
          appliesTo: ratingAppliesTo,
          hasOptions: ratingHasOptions,
        }),
      );

      toast.success("Fields updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "addSelectors":
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Add New Selector Form Component */}
            <div className={panelClass}>
              <div className={panelHeaderClass}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Add New Selector
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Search registered users by mobile number.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {/* Phone Input */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Phone Number
                  </label>
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 transition focus-within:border-[var(--border-primary)] focus-within:bg-[var(--bg-card)]">
                    <Phone className="h-4 w-4 text-[var(--primary)]" />
                    <input
                      type="tel"
                      value={contact}
                      onChange={handleContactChange}
                      placeholder="Enter 10 digit mobile number"
                      maxLength={10}
                      className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--text-primary)]">
                    Selector Name
                  </label>
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 transition focus-within:border-[var(--border-primary)] focus-within:bg-[var(--bg-card)]">
                    <User className="h-4 w-4 text-[var(--primary)]" />
                    <input
                      type="text"
                      value={name}
                      disabled={!addName}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      placeholder={addName ? "Type Name" : "Auto fetched name"}
                      className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:text-[var(--text-secondary)]"
                    />
                  </div>
                  {sendAdminId && !addName && (
                    <p className="mt-1 text-xs font-medium text-emerald-600">
                      Name auto-fetched from registered user
                    </p>
                  )}
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddSelector}
                  className={`${secondaryButtonClass} w-full`}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Selector
                </button>
              </div>
            </div>

            <div className={panelClass}>
              <div className={panelHeaderClass}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        Existing Selectors
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        {selectorList.length} selector
                        {selectorList.length !== 1 ? "s" : ""} added
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4 [scrollbar-color:var(--border-primary)_var(--bg-main)] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-primary)] [&::-webkit-scrollbar-track]:bg-[var(--bg-main)] [&::-webkit-scrollbar]:w-2">
                {selectorList.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] py-8 text-center text-sm text-[var(--text-secondary)]">
                    No selectors added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectorList.map((selector) => (
                      <div
                        key={selector._id}
                        className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 transition hover:border-[var(--border-primary)] hover:bg-[var(--bg-card)]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-sm font-bold uppercase text-[var(--primary)]">
                            {selector?.name?.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                              {selector.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSelector(selector._id)}
                          className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 transition hover:bg-red-50"
                          title="Remove selector"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "rating":
        return (
          <Rating
            auctionId={auctionId}
            details={{
              trailTypeAuction: auction?.trailTypeAuction,
              trailStart: auction?.trailStart,
              trailEnd: auction?.trailEnd,
              ratingToSelectPlayers: {
                allrounder: auction?.ratingToSelectPlayers?.allrounder,
                batsman: auction?.ratingToSelectPlayers?.batsman,
                bowler: auction?.ratingToSelectPlayers?.bowler,
                wicketkeeper: auction?.ratingToSelectPlayers?.wicketkeeper,
              },
            }}
            fetch={() => dispatch(fetchAuctionDetails(auctionId))}
          />
        );

      case "addFields":
        return (
          <div className="space-y-4">
            {/* Add Fields Section */}
            <div className={panelClass}>
              <div className={`${panelHeaderClass} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Add Custom Fields
                  </h3>

                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    Create custom fields for player ratings
                  </p>
                </div>
                <button
                  onClick={handleAddField}
                  className={`${secondaryButtonClass} w-full sm:w-auto`}
                >
                  <Plus className="h-4 w-4" />
                  Add New Field
                </button>
              </div>

              <div className="p-4">
                {fields.length === 0 && (
                  <p className="rounded-lg border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] py-8 text-center text-sm text-[var(--text-secondary)]">
                    No fields added yet. Click "Add New Field" to get started.
                  </p>
                )}

                <div className="space-y-4">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3"
                    >
                      <input
                        type="text"
                        value={field.label}
                        placeholder="Enter field label (e.g., 'Batting Style')"
                        onChange={(e) =>
                          handleChange(field.id, "label", e.target.value)
                        }
                        className={`${fieldClass} mb-3`}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        <select
                          value={field.fieldType || "input"}
                          onChange={(e) =>
                            handleFieldTypeChange(field.id, e.target.value)
                          }
                          className={selectClass}
                        >
                          <option value="input">Input Field</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="radio">Radio Buttons</option>
                        </select>

                        <select
                          value={field.appliesTo || "all"}
                          onChange={(e) =>
                            handleChange(field.id, "appliesTo", e.target.value)
                          }
                          className={selectClass}
                        >
                          <option value="all">All Players</option>
                          <option value="batsman">Batsman Only</option>
                          <option value="bowler">Bowler Only</option>
                          <option value="allrounder">Allrounder Only</option>
                          <option value="wicketkeeper">
                            Wicketkeeper Only
                          </option>
                        </select>

                        {(field.fieldType || "input") === "input" ? (
                          <select
                            value={field.type || "string"}
                            onChange={(e) =>
                              handleChange(field.id, "type", e.target.value)
                            }
                            className={selectClass}
                          >
                            <option value="string">Text Value</option>
                            <option value="number">Number Value</option>
                          </select>
                        ) : (
                          <div className="flex h-10 items-center rounded-lg border border-[var(--border-card)] bg-[var(--secondary-lighter)] px-3 text-sm text-[var(--text-secondary)]">
                            Value type: String
                          </div>
                        )}
                      </div>

                      {((field.fieldType || "input") === "dropdown" ||
                        (field.fieldType || "input") === "radio" ||
                        (field.fieldType || "input") === "checkbox") && (
                        <div className="mb-3 space-y-2">
                          <label className="text-sm font-semibold text-[var(--text-primary)]">
                            Options
                          </label>
                          {(field.optionsList || []).map(
                            (optionValue, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={optionValue}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      field.id,
                                      optionIndex,
                                      e.target.value,
                                    )
                                  }
                                  className={fieldClass}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption(field.id, optionIndex)
                                  }
                                  className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] px-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ),
                          )}
                          <button
                            type="button"
                            onClick={() => handleAddOption(field.id)}
                            className={outlineButtonClass}
                          >
                            <Plus className="h-4 w-4" />
                            Add Option
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(field.id)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-[var(--bg-card)] px-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 sm:w-full md:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Field
                      </button>
                    </div>
                  ))}
                </div>

                { 
                  <button
                    onClick={handleUpdate}
                    className={`${secondaryButtonClass} mt-4 w-full sm:w-auto`}
                  >
                    <Save className="h-4 w-4" />
                    Update Fields
                  </button>
                }
              </div>
            </div>

            {/* Saved Fields Section - Improved for mobile */}
            <div className={panelClass}>
              <div className={panelHeaderClass}>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Saved Fields</h3>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Manage existing rating fields
                </p>
              </div>

              <div className="p-4">
                {/* Filters - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={ratingSearch}
                    onChange={(e) => {
                      setRatingSearch(e.target.value);
                      setRatingPage(1);
                    }}
                    placeholder="Search label"
                    className={`${fieldClass} pl-10`}
                  />
                  </div>

                  <select
                    value={ratingFieldType}
                    onChange={(e) => {
                      setRatingFieldType(e.target.value);
                      setRatingPage(1);
                    }}
                    className={selectClass}
                  >
                    <option value="">All Field Types</option>
                    <option value="input">Input</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="radio">Radio</option>
                  </select>

                  <select
                    value={ratingType}
                    onChange={(e) => {
                      setRatingType(e.target.value);
                      setRatingPage(1);
                    }}
                    className={selectClass}
                  >
                    <option value="">All Value Types</option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                  </select>

                  <select
                    value={ratingAppliesTo}
                    onChange={(e) => {
                      setRatingAppliesTo(e.target.value);
                      setRatingPage(1);
                    }}
                    className={selectClass}
                  >
                    <option value="">All Players</option>
                    <option value="all">All</option>
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="allrounder">Allrounder</option>
                    <option value="wicketkeeper">Wicketkeeper</option>
                  </select>

                  <select
                    value={ratingHasOptions}
                    onChange={(e) => {
                      setRatingHasOptions(e.target.value);
                      setRatingPage(1);
                    }}
                    className={selectClass}
                  >
                    <option value="">Has Options?</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRatingSearch("");
                      setRatingFieldType("");
                      setRatingType("");
                      setRatingAppliesTo("");
                      setRatingHasOptions("");
                      setRatingPage(1);
                    }}
                    className={`${outlineButtonClass} w-full sm:w-auto`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Filters
                  </button>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Total: {filteredRatingFieldsTotal} fields
                  </span>
                </div>

                {/* Fields List */}
                <div className="overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                  {isRatingFieldsLoading ? (
                    <div className="p-8 flex justify-center">
                      <Loader text="Loading fields..." />
                    </div>
                  ) : filteredRatingFields.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                      No fields found
                    </div>
                  ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredRatingFields.map((item) => (
    <div
      key={item?._id || `${item?.label}-${item?.fieldType}`}
      className="group relative overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 transition-all duration-200 hover:border-[var(--border-primary)] hover:shadow-sm"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1">{item?.label}</h3>
          <span className="rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
            {item?.fieldType}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
            {item?.type}
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
           Applies to - {item?.appliesTo}
          </span>
        </div>

        {Array.isArray(item?.options) && item.options.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {item.options.map((option, idx) => (
                <span key={idx} className="rounded bg-[var(--secondary-lighter)] px-1.5 py-0.5 text-[11px] text-[var(--text-secondary)]">
                  {option}
                </span>
              ))}
             
            </div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
                  )}
                </div>

                {/* Pagination - Responsive */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={filteredRatingFieldsPage <= 1}
                    onClick={() =>
                      setRatingPage((prev) => Math.max(1, prev - 1))
                    }
                    className={`${outlineButtonClass} w-full sm:w-auto`}
                  >
                    Previous
                  </button>

                  <span className="text-sm text-[var(--text-secondary)]">
                    Page {filteredRatingFieldsPage} of{" "}
                    {filteredRatingFieldsPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      filteredRatingFieldsPage >= filteredRatingFieldsPages
                    }
                    onClick={() =>
                      setRatingPage((prev) =>
                        prev < filteredRatingFieldsPages ? prev + 1 : prev,
                      )
                    }
                    className={`${outlineButtonClass} w-full sm:w-auto`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-4 text-[var(--text-primary)] sm:px-4 lg:px-5">
      {/* Header Section */}
      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Trial Controls
            </p>
            <h2 className="mt-1 text-xl font-bold leading-7 text-[var(--text-primary)]">
              Trial Settings
            </h2>
            <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              Manage selectors, rating rules, and custom rating fields.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - Made responsive with scroll on small screens */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-card)]">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--secondary)] text-[#102033] shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--secondary-lighter)] hover:text-[var(--text-primary)]"
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
    </div>
  );
};

export default Settings;
