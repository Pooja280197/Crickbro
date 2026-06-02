import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { X, MapPin, Users, ChevronDown, ChevronUp, Tag } from "lucide-react";

const CreateSlot = ({
  isOpen,
  onClose,
  slotData,
  onSlotChange,
  onCreate,
  selectors = [],
  isEditing,
  onUpdate,
}) => {
  // -------- STATE --------
  const [errors, setErrors] = useState({});
  const [openSelectorDropdown, setOpenSelectorDropdown] = useState(false);

  const countryOptions = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  const stateOptions = slotData?.location?.country
    ? State.getStatesOfCountry(slotData.location.country).map((s) => ({
        value: s.isoCode,
        label: s.name,
      }))
    : [];

  const cityOptions = slotData?.location?.state
    ? City.getCitiesOfState(
        slotData.location.country,
        slotData.location.state,
      ).map((c) => ({
        value: c.name,
        label: c.name,
      }))
    : [];

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setOpenSelectorDropdown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    let newErrors = {};

    if (!slotData.slotName?.trim()) {
      newErrors.slotName = "Slot name is required";
    }

    if (!slotData.location?.venue?.trim()) {
      newErrors["location.venue"] = "Venue is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (isEditing) {
      onUpdate(slotData);
    } else {
      onCreate();
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const currentSelectors = slotData.selectors || [];
    const updated = checked
      ? [...currentSelectors, value]
      : currentSelectors.filter((id) => id !== value);

    onSlotChange({
      target: { name: "selectors", value: updated },
    });

    if (errors.selectors) {
      setErrors((prev) => ({ ...prev, selectors: undefined }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "location.pincode") {
      let val = value.replace(/\D/g, "");
      if (val.length > 6) val = val.slice(0, 6);
      onSlotChange({
        target: {
          name: "location",
          value: { ...slotData.location, pincode: val },
        },
      });
      return;
    }

    if (name.includes("location.")) {
      const field = name.split(".")[1];
      onSlotChange({
        target: {
          name: "location",
          value: { ...slotData.location, [field]: value },
        },
      });
      return;
    }
    onSlotChange(e);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 ">
      <div className="bg-white rounded-xl w-full max-w-5xl h-auto max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {isEditing ? "Edit Slot" : "Create New Slot"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
              Fill in the details below to {isEditing ? "update" : "create"} a slot
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Two Column Layout for Desktop */}
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Left Column - Basic Info & Location */}
            <div className="flex-1 space-y-5">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slot Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="slotName"
                      value={slotData?.slotName || ""}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm ${
                        errors.slotName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter slot name"
                    />
                    {errors.slotName && (
                      <p className="text-red-500 text-xs mt-1">{errors.slotName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slot Code {isEditing && <span className="text-xs text-gray-400">(Read-only)</span>}
                    </label>
                    <input
                      type="text"
                      name="slotCode"
                      value={slotData?.slotCode || ""}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm ${
                        errors.slotCode ? "border-red-500" : "border-gray-300"
                      } ${isEditing ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
                      placeholder="Enter slot code"
                      readOnly={isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={slotData?.description || ""}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm resize-none"
                    placeholder="Describe the slot (optional)"
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location.venue"
                    value={slotData?.location?.venue || ""}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm ${
                      errors["location.venue"] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter venue name"
                  />
                  {errors["location.venue"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["location.venue"]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <Select
                      options={countryOptions}
                      placeholder="Select country"
                      value={countryOptions.find((c) => c.value === slotData?.location?.country) || null}
                      onChange={(selected) =>
                        handleChange({
                          target: { name: "location.country", value: selected?.value || "" },
                        })
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({ ...base, minHeight: '40px' }),
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <Select
                      options={stateOptions}
                      placeholder="Select state"
                      value={stateOptions.find((s) => s.value === slotData?.location?.state) || null}
                      onChange={(selected) =>
                        handleChange({
                          target: { name: "location.state", value: selected?.value || "" },
                        })
                      }
                      isDisabled={!slotData?.location?.country}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({ ...base, minHeight: '40px' }),
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <Select
                      options={cityOptions}
                      placeholder="Select city"
                      value={cityOptions.find((c) => c.value === slotData?.location?.city) || null}
                      onChange={(selected) =>
                        handleChange({
                          target: { name: "location.city", value: selected?.value || "" },
                        })
                      }
                      isDisabled={!slotData?.location?.state}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({ ...base, minHeight: '40px' }),
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="location.pincode"
                      value={slotData?.location?.pincode || ""}
                      onChange={handleChange}
                      maxLength="6"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="location.address"
                    value={slotData?.location?.address || ""}
                    onChange={handleChange}
                    rows="1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm resize-none"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
                  <input
                    type="url"
                    name="location.link"
                    value={slotData?.location?.link || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Selectors Section (Highlighted) */}
            <div className="lg:w-80 mt-6 lg:mt-0">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">Selectors</h3>
                    <p className="text-xs text-gray-500">Assign selectors to this slot</p>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="border border-blue-300 bg-white rounded-lg p-2.5 cursor-pointer flex justify-between items-center hover:border-blue-400 transition-all"
                    onClick={() => setOpenSelectorDropdown(!openSelectorDropdown)}
                  >
                    <span className="text-sm text-gray-600">
                      {slotData?.selectors?.length > 0
                        ? `${slotData.selectors.length} selector${slotData.selectors.length > 1 ? 's' : ''} selected`
                        : "Choose selectors"}
                    </span>
                    {openSelectorDropdown ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {openSelectorDropdown && (
                    <div className="absolute top-full left-0 w-full bg-white border border-blue-200 rounded-lg mt-1 max-h-56 overflow-y-auto shadow-lg z-30">
                      <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
                        <input
                          type="text"
                          placeholder="Search selectors..."
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                          onChange={(e) => {
                            const searchTerm = e.target.value.toLowerCase();
                            const items = document.querySelectorAll('.selector-item');
                            items.forEach(item => {
                              const text = item.textContent?.toLowerCase() || '';
                              item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
                            });
                          }}
                        />
                      </div>
                      <div className="p-2">
                        {selectors.length > 0 ? (
                          selectors.map((item) => (
                            <label
                              key={item._id}
                              className="selector-item flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                value={item._id}
                                checked={slotData?.selectors?.includes(item._id) || false}
                                onChange={handleCheckboxChange}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700 text-sm flex-1">{item.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-4">
                            No selectors available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {slotData?.selectors?.length > 0 && !openSelectorDropdown && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Selected ({slotData.selectors.length}):
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {selectors
                        .filter((item) => slotData?.selectors.includes(item._id))
                        .map((item) => (
                          <span
                            key={item._id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {item.name}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = slotData.selectors.filter(
                                  (id) => id !== item._id,
                                );
                                onSlotChange({
                                  target: { name: "selectors", value: updated },
                                });
                              }}
                              className="ml-1 hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {errors.selectors && (
                  <p className="text-red-500 text-xs mt-2">{errors.selectors}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            {isEditing ? "Update Slot" : "Create Slot"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSlot;