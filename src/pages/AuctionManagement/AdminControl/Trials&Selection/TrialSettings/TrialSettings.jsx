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
          <div className="flex flex-col lg:flex-row gap-6 w-full justify-between">
            {/* Add New Selector Form Component */}
            <div className="border  rounded-lg bg-gray-50 border-gray-300 shadow-lg w-full lg:w-1/2">
              <div className="border-b px-4 py-3 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add New Selector
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add selectors by phone number
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
                    Selector Name
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition">
                    <span className="text-gray-400 text-sm">👤</span>
                    <input
                      type="text"
                      value={name}
                      disabled={!addName}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      placeholder={addName ? "Type Name" : "Auto fetched name"}
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
                  onClick={handleAddSelector}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Selector
                </button>
              </div>
            </div>

            <div className="border rounded-lg bg-gray-50 border-gray-300 shadow-lg w-full lg:w-1/2">
              <div className="border-b px-4 py-3 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Existing Selectors
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectorList.length} selector
                  {selectorList.length !== 1 ? "s" : ""} added
                </p>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto">
                {selectorList.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    No selectors added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectorList.map((selector) => (
                      <div
                        key={selector._id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                            {selector?.name?.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {selector.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSelector(selector._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                          title="Remove selector"
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
          <div className="space-y-6">
            {/* Add Fields Section */}
            <div className="border rounded-lg bg-gray-50 border-gray-300 shadow-lg">
              <div className="border-b px-4 py-3 bg-white  rounded-t-lg flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Add Custom Fields
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Create custom fields for player ratings
                  </p>
                </div>
                <button
                  onClick={handleAddField}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors mb-4 w-full sm:w-auto"
                >
                  + Add New Field
                </button>
              </div>

              <div className="p-4">
                {fields.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No fields added yet. Click "Add New Field" to get started.
                  </p>
                )}

                <div className="space-y-4">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 bg-white "
                    >
                      <input
                        type="text"
                        value={field.label}
                        placeholder="Enter field label (e.g., 'Batting Style')"
                        onChange={(e) =>
                          handleChange(field.id, "label", e.target.value)
                        }
                        className="border p-2 rounded w-full mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        <select
                          value={field.fieldType || "input"}
                          onChange={(e) =>
                            handleFieldTypeChange(field.id, e.target.value)
                          }
                          className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
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
                          className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
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
                            className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                          >
                            <option value="string">Text Value</option>
                            <option value="number">Number Value</option>
                          </select>
                        ) : (
                          <div className="border p-2 rounded text-sm text-gray-500 bg-gray-50 flex items-center">
                            Value type: String
                          </div>
                        )}
                      </div>

                      {((field.fieldType || "input") === "dropdown" ||
                        (field.fieldType || "input") === "radio" ||
                        (field.fieldType || "input") === "checkbox") && (
                        <div className="mb-3 space-y-2">
                          <label className="text-sm font-medium text-gray-700">
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
                                  className="border p-2 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption(field.id, optionIndex)
                                  }
                                  className="px-3 py-1 text-sm border border-red-300 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                          <button
                            type="button"
                            onClick={() => handleAddOption(field.id)}
                            className="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50 shadow-md"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(field.id)}
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-1 rounded-lg text-sm hover:underline sm:w-full md:w-1/4 items-center justify-center flex gap-1 transition-colors"
                      >
                        Delete Field
                      </button>
                    </div>
                  ))}
                </div>

                { 
                  <button
                    onClick={handleUpdate}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors w-full sm:w-auto"
                  >
                    Update Fields
                  </button>
                }
              </div>
            </div>

            {/* Saved Fields Section - Improved for mobile */}
            <div className="border rounded-lg bg-gray-50 border-gray-300 shadow-lg">
              <div className="border-b px-4 py-3 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-800">Saved Fields</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage existing rating fields
                </p>
              </div>

              <div className="p-4">
                {/* Filters - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                  <input
                    type="text"
                    value={ratingSearch}
                    onChange={(e) => {
                      setRatingSearch(e.target.value);
                      setRatingPage(1);
                    }}
                    placeholder="Search label"
                    className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />

                  <select
                    value={ratingFieldType}
                    onChange={(e) => {
                      setRatingFieldType(e.target.value);
                      setRatingPage(1);
                    }}
                    className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
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
                    className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
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
                    className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
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
                    className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
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
                    className="px-3 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50 shadow-md w-full sm:w-auto"
                  >
                    Reset Filters
                  </button>
                  <span className="text-xs text-gray-500">
                    Total: {filteredRatingFieldsTotal} fields
                  </span>
                </div>

                {/* Fields List */}
                <div className="border rounded-md overflow-hidden">
                  {isRatingFieldsLoading ? (
                    <div className="p-8 flex justify-center">
                      <Loader text="Loading fields..." />
                    </div>
                  ) : filteredRatingFields.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      No fields found
                    </div>
                  ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredRatingFields.map((item) => (
    <div
      key={item?._id || `${item?.label}-${item?.fieldType}`}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md"
    >
      {/* Colored top accent bar */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{item?.label}</h3>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
            {item?.fieldType}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
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
                <span key={idx} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
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
                    className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
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
                    className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Trial Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage selectors and ratings
        </p>
      </div>

      {/* Tabs - Made responsive with scroll on small screens */}
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
    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow- scale-[1.02]"
    : "bg-white/80 text-gray-600 border border-white shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:text-purple-600"
}`}
              >
                {/* Glow Effect */}
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

                {/* Text */}
                <span className="relative z-10">{tab.label}</span>

                {/* Bottom Dot */}
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
    </div>
  );
};

export default Settings;
