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

  const fieldBase =
    "w-full rounded-lg border bg-[var(--bg-main)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15";
  const fieldClass = (error) =>
    `${fieldBase} ${error ? "border-red-500" : "border-[var(--border-primary)]"}`;
  const sectionClass =
    "rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-sm";
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "0.5rem",
      borderColor: "var(--border-primary)",
      backgroundColor: "var(--bg-main)",
      boxShadow: "none",
      transition: "none",
      "&:hover": { borderColor: "var(--border-primary)" },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 60,
      borderRadius: "0.5rem",
      overflow: "hidden",
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border-card)",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      color: "var(--text-primary)",
      backgroundColor: state.isSelected
        ? "var(--accent-light)"
        : "var(--bg-card)",
      transition: "none",
    }),
    singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
    placeholder: (base) => ({ ...base, color: "var(--text-muted)" }),
  };

  return (
    <div className="fixed inset-0 z-[120000] flex items-center justify-center overflow-y-auto bg-black/50 p-3 pt-4 backdrop-blur-sm sm:p-4">
      <div className="flex h-auto max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl sm:max-h-[88vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
              {isEditing ? "Edit Slot" : "Create New Slot"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 hidden sm:block">
              Fill in the details below to {isEditing ? "update" : "create"} a
              slot
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--secondary-lighter)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg-main)] p-4 [scrollbar-color:var(--border-primary)_var(--bg-main)] [scrollbar-width:thin] sm:p-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-primary)] [&::-webkit-scrollbar-track]:bg-[var(--bg-main)] [&::-webkit-scrollbar]:w-2">
          {/* Two Column Layout for Desktop */}
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Left Column - Basic Info & Location */}
            <div className="flex-1 space-y-4">
              {/* Basic Information Section */}
              <div className={sectionClass}>
                <div className="mb-4 flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Basic Information
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Name, code and short description for this slot.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Slot Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="slotName"
                      value={slotData?.slotName || ""}
                      onChange={handleChange}
                      className={fieldClass(errors.slotName)}
                      placeholder="Enter slot name"
                    />
                    {errors.slotName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.slotName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Slot Code
                    </label>
                    <input
                      type="text"
                      name="slotCode"
                      value={slotData?.slotCode || ""}
                      onChange={handleChange}
                      className={`${fieldClass(errors.slotCode)} bg-[var(--secondary-lighter)] text-[var(--text-secondary)]`}
                      placeholder="Enter slot code"
                    
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={slotData?.description || ""}
                    onChange={handleChange}
                    rows="2"
                    className={`${fieldBase} min-h-[76px] resize-none border-[var(--border-primary)]`}
                    placeholder="Describe the slot (optional)"
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className={sectionClass}>
                <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--primary)]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Location Details
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Venue and address details for trials.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location.venue"
                    value={slotData?.location?.venue || ""}
                    onChange={handleChange}
                    className={fieldClass(errors["location.venue"])}
                    placeholder="Enter venue name"
                  />
                  {errors["location.venue"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["location.venue"]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Country
                    </label>
                    <Select
                      options={countryOptions}
                      placeholder="Select country"
                      value={
                        countryOptions.find(
                          (c) => c.value === slotData?.location?.country,
                        ) || null
                      }
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "location.country",
                            value: selected?.value || "",
                          },
                        })
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={selectStyles}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      State
                    </label>
                    <Select
                      options={stateOptions}
                      placeholder="Select state"
                      value={
                        stateOptions.find(
                          (s) => s.value === slotData?.location?.state,
                        ) || null
                      }
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "location.state",
                            value: selected?.value || "",
                          },
                        })
                      }
                      isDisabled={!slotData?.location?.country}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={selectStyles}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      City
                    </label>
                    <Select
                      options={cityOptions}
                      placeholder="Select city"
                      value={
                        cityOptions.find(
                          (c) => c.value === slotData?.location?.city,
                        ) || null
                      }
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "location.city",
                            value: selected?.value || "",
                          },
                        })
                      }
                      isDisabled={!slotData?.location?.state}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={selectStyles}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="location.pincode"
                      value={slotData?.location?.pincode || ""}
                      onChange={handleChange}
                      maxLength="6"
                      className={`${fieldBase} border-[var(--border-primary)]`}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Address
                  </label>
                  <textarea
                    name="location.address"
                    value={slotData?.location?.address || ""}
                    onChange={handleChange}
                    rows="1"
                    className={`${fieldBase} min-h-[42px] resize-none border-[var(--border-primary)]`}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Map Link
                  </label>
                  <input
                    type="url"
                    name="location.link"
                    value={slotData?.location?.link || ""}
                    onChange={handleChange}
                    className={`${fieldBase} border-[var(--border-primary)]`}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Selectors Section (Highlighted) */}
            <div className="mt-6 lg:mt-0 lg:w-80">
              <div className="sticky top-4 rounded-lg border border-[var(--border-primary)] bg-[linear-gradient(135deg,var(--secondary-lighter),var(--accent-light))] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="rounded-lg bg-[var(--bg-card)] p-1.5 text-[var(--primary)] shadow-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      Selectors
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Assign selectors to this slot
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] p-2.5 transition-all hover:border-[var(--primary)]"
                    onClick={() =>
                      setOpenSelectorDropdown(!openSelectorDropdown)
                    }
                  >
                    <span className="text-sm text-[var(--text-secondary)]">
                      {slotData?.selectors?.length > 0
                        ? `${slotData.selectors.length} selector${slotData.selectors.length > 1 ? "s" : ""} selected`
                        : "Choose selectors"}
                    </span>
                    {openSelectorDropdown ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </div>

                  {openSelectorDropdown && (
                    <div className="absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] shadow-lg">
                      <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-soft)] p-2">
                        <input
                          type="text"
                          placeholder="Search selectors..."
                          className="w-full rounded border border-[var(--border-card)] px-2 py-1.5 text-sm focus:border-[var(--primary)] focus:outline-none"
                          onChange={(e) => {
                            const searchTerm = e.target.value.toLowerCase();
                            const items =
                              document.querySelectorAll(".selector-item");
                            items.forEach((item) => {
                              const text =
                                item.textContent?.toLowerCase() || "";
                              item.style.display = text.includes(searchTerm)
                                ? "flex"
                                : "none";
                            });
                          }}
                        />
                      </div>
                      <div className="p-2">
                        {selectors.length > 0 ? (
                          selectors.map((item) => (
                            <label
                              key={item._id}
                              className="selector-item flex cursor-pointer items-center gap-2 rounded p-2 transition-colors hover:bg-[var(--secondary-lighter)]"
                            >
                              <input
                                type="checkbox"
                                value={item._id}
                                checked={
                                  slotData?.selectors?.includes(item._id) ||
                                  false
                                }
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 rounded border-[var(--border-primary)] text-[var(--primary)] focus:ring-[var(--primary)]"
                              />
                              <span className="text-[var(--text-primary)] text-sm flex-1">
                                {item.name}
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-[var(--text-secondary)] text-sm text-center py-4">
                            No selectors available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {slotData?.selectors?.length > 0 && !openSelectorDropdown && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                      Selected ({slotData.selectors.length}):
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {selectors
                        .filter((item) =>
                          slotData?.selectors.includes(item._id),
                        )
                        .map((item) => (
                          <span
                            key={item._id}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--primary)]"
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
                              className="ml-1 hover:text-[var(--primary-dark)]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {errors.selectors && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.selectors}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 flex gap-3 border-t border-[var(--border-card)] bg-[var(--bg-main)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-soft)] transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-[linear-gradient(135deg,var(--secondary),var(--secondary-strong))] px-4 py-2 text-sm font-semibold text-[#102033] shadow-sm transition hover:opacity-90"
          >
            {isEditing ? "Update Slot" : "Create Slot"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSlot;
