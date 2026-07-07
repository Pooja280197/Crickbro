import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Bold,
  Alignment,
  BlockQuote,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  RemoveFormat,
  Strikethrough,
  Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import {
  FiSave, FiEye, FiUpload, FiPlus, FiTrash2, FiX, FiLoader,
  FiChevronRight, FiChevronLeft, FiSettings, FiSliders,
  FiFileText, FiTrendingUp, FiList, FiAward, FiImage,
  FiGrid, FiHelpCircle, FiGlobe, FiLock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api";
import { toast } from "react-toastify";
import BarcodeShareAdmin from "./BarcodeShareAdmin";

const LockedState = ({ onGoToBasicInfo }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-16 h-16 bg-[var(--secondary-lighter)] rounded-2xl flex items-center justify-center mb-4">
      <FiLock size={28} className="text-[var(--text-muted)]" />
    </div>
    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Tab Locked</h3>
    <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-5 leading-relaxed">
      Complete the Basic Info section first. Fill in the tournament title, name, and description, then click "Next" to save and unlock all tabs.
    </p>
    <button onClick={onGoToBasicInfo} className="lp-ui-btn-secondary text-sm px-5 py-2">
      Go to Basic Info →
    </button>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="lp-field">
    <label className="lp-label">{label}</label>
    {hint && <p className="lp-hint">{hint}</p>}
    {children}
  </div>
);

const SectionHeader = ({ title, description, action }) => (
  <div className="lp-section-header">
    <div>
      <h2 className="lp-section-title">{title}</h2>
      {description && <p className="lp-section-desc">{description}</p>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="lp-empty">
    <div className="lp-empty-icon">+</div>
    <p>{message}</p>
  </div>
);

const digitsOnly = (value) => value.replace(/\D/g, "");
const hasRichTextContent = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const shortDescriptionEditorConfig = {
  licenseKey: "GPL",
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Link,
    List,
    FontColor,
    FontBackgroundColor,
    FontSize,
    FontFamily,
    Alignment,
    RemoveFormat,
    BlockQuote,
  ],
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "fontColor",
    "fontBackgroundColor",
    "fontSize",
    "fontFamily",
    "|",
    "alignment",
    "|",
    "bulletedList",
    "numberedList",
    "|",
    "blockQuote",
    "link",
    "removeFormat",
    "|",
    "undo",
    "redo",
  ],
  placeholder: "Brief, compelling description of the tournament...",
};

const TournamentAdminForm = ({ tournamentId, auctionId, TrialType }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [landingPageId, setLandingPageId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [isBasicInfoSaved, setIsBasicInfoSaved] = useState(false);
  const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { id: "registration", label: "Basic Info", icon: <FiFileText size={16} />, description: "Tournament title, name & display settings", lockedByDefault: false },
    { id: "header", label: "Contact", icon: <FiSettings size={16} />, description: "Contact details and social media links", lockedByDefault: true },
    { id: "slider", label: "Slider", icon: <FiSliders size={16} />, description: "Hero banner images for the page", requiresSave: true, lockedByDefault: true },
    { id: "keyFeatures", label: "Features", icon: <FiTrendingUp size={16} />, description: "Highlights and key selling points", requiresSave: true, lockedByDefault: true },
    { id: "rules", label: "Rules", icon: <FiList size={16} />, description: "Tournament guidelines and regulations", requiresSave: true, lockedByDefault: true },
    { id: "sponsors", label: "Sponsors", icon: <FiAward size={16} />, description: "Partner logos and sponsor tiers", requiresSave: true, lockedByDefault: true },
    { id: "gallery", label: "Gallery", icon: <FiImage size={16} />, description: "Photo gallery for the landing page", requiresSave: true, lockedByDefault: true },
    { id: "cardImages", label: "Guest Gallery", icon: <FiGrid size={16} />, description: "Featured guest image cards", requiresSave: true, lockedByDefault: true },
    { id: "faqs", label: "FAQ", icon: <FiHelpCircle size={16} />, description: "Frequently asked questions", requiresSave: true, lockedByDefault: true },
    { id: "meta", label: "SEO", icon: <FiGlobe size={16} />, description: "Meta tags and search engine settings", lockedByDefault: true },
  ];

  const isStepLocked = (stepId) => {
    if (stepId === "registration") return false;
    if (isBasicInfoSaved && landingPageId) return false;
    return true;
  };

  const markFieldAsTouched = (field) => setTouchedFields((prev) => ({ ...prev, [field]: true }));

  const getStepErrorStatus = (stepId) => {
    switch (stepId) {
      case "header": return !!(validationErrors.contactInfo || validationErrors.socialAccounts);
      case "slider": return !!validationErrors.sliderImages;
      case "registration": return !!(validationErrors.tournamentTitle || validationErrors.tournamentName || validationErrors.description);
      case "keyFeatures": return !!validationErrors.keyFeatures;
      case "rules": return !!validationErrors.rules;
      case "gallery": return !!validationErrors.galleryImages;
      case "cardImages": return !!validationErrors.cardImages;
      case "faqs": return !!validationErrors.questionsAnswers;
      default: return false;
    }
  };

  const [formData, setFormData] = useState({
    tournamentId, auctionId,
    tournamentTitle: "", tournamentName: "", description: "",
    sliderImages: [],
    contactInfo: { email: "", mobileNumber: "", phoneNumber: "", website: "" },
    socialAccounts: [],
    keyFeatures: { title: "Key Features", features: [] },
    rules: { title: "Rules & Guidelines", description: "", items: [] },
    sponsors: [], galleryImages: [], questionsAnswers: [],
    cardImages: { title: "Gallery", description: "", Images: [] },
    showTrialLocations: false, showRegistrationForm: false, showTeamRegistration: false,
    metaTitle: "", metaDescription: "", metaKeywords: "", isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/webSiteApi/auctionLandingPage/auctionLandingPage?tournamentId=${tournamentId}&auctionId=${auctionId}&includeInactive=true`);
      const data = response.data.data.landingPage;
      setPageData(data);
      if (data && data._id) {
        setLandingPageId(data._id);
        setIsBasicInfoSaved(true);
        setFormData({
          tournamentId: data.tournamentId?._id || tournamentId,
          auctionId: data.auctionId?._id || auctionId,
          tournamentTitle: data.tournamentTitle || "",
          tournamentName: data.tournamentName || "",
          description: data.description || "",
          sliderImages: data.sliderImages || [],
          contactInfo: data.contactInfo || { email: "", mobileNumber: "", phoneNumber: "", website: "" },
          socialAccounts: data.socialAccounts || [],
          keyFeatures: { title: data.keyFeatures?.title ?? "Key Features", features: Array.isArray(data.keyFeatures?.features) ? data.keyFeatures.features : [] },
          rules: { title: data.rules?.title ?? "Rules & Guidelines", description: data.rules?.description ?? "", items: Array.isArray(data.rules?.items) ? data.rules.items : [] },
          sponsors: data.sponsors || [],
          galleryImages: data.galleryImages || [],
          questionsAnswers: data.questionsAnswers || [],
          cardImages: (() => { const c = data.cardImages; return { title: c?.title ?? "Gallery", description: c?.description ?? "", Images: Array.isArray(c?.Images) ? c.Images : [] }; })(),
          showTrialLocations: data.showTrialLocations ?? false,
          showRegistrationForm: data.showRegistrationForm ?? false,
          showTeamRegistration: data.showTeamRegistration ?? false,
          metaTitle: data.metaTitle || "", metaDescription: data.metaDescription || "", metaKeywords: data.metaKeywords || "",
          isActive: data.isActive ?? true,
        });
      }
    } catch (err) {
      console.error(err);
      setIsBasicInfoSaved(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [tournamentId, auctionId]);

  const buildBasicInfoPayload = () => ({
    tournamentId: formData.tournamentId, auctionId: formData.auctionId,
    tournamentTitle: formData.tournamentTitle, tournamentName: formData.tournamentName,
    description: formData.description,
    contactInfo: formData.contactInfo || { email: "", mobileNumber: "", phoneNumber: "", website: "" },
    socialAccounts: formData.socialAccounts || [],
    showTrialLocations: formData.showTrialLocations || false,
    showRegistrationForm: formData.showRegistrationForm || false,
    showTeamRegistration: formData.showTeamRegistration || false,
    isActive: formData.isActive,
    metaTitle: formData.metaTitle || "", metaDescription: formData.metaDescription || "", metaKeywords: formData.metaKeywords || "",
    sliderImages: [], keyFeatures: { title: "Key Features", features: [] },
    rules: { title: "Rules & Guidelines", description: "", items: [] },
    sponsors: [], galleryImages: [], questionsAnswers: [],
    cardImages: { title: "Gallery", description: "", Images: [] },
  });

  const buildCompletePayload = () => {
    const rawCard = formData.cardImages || { title: "Gallery", description: "", Images: [] };
    const keyFeat = formData.keyFeatures || { title: "Key Features", features: [] };
    const rulesSection = formData.rules || { title: "Rules & Guidelines", description: "", items: [] };
    const sponsors = (formData.sponsors || [])
      .map((sponsor, index) => ({
        ...sponsor,
        name: String(sponsor?.name || "").trim(),
        logo: String(sponsor?.logo || sponsor?.url || "").trim(),
        website: String(sponsor?.website || "").trim(),
        tier: sponsor?.tier || "partner",
        order: Number(sponsor?.order) || index + 1,
      }))
      .filter((sponsor) => sponsor.name && sponsor.logo);

    return {
      tournamentId: formData.tournamentId, auctionId: formData.auctionId,
      tournamentTitle: formData.tournamentTitle, tournamentName: formData.tournamentName,
      description: formData.description,
      sliderImages: (formData.sliderImages || []).filter((s) => String(s?.imageUrl || s?.url || "").trim()),
      keyFeatures: { ...keyFeat, features: (keyFeat.features || []).filter((f) => f?.title?.trim() && f?.description?.trim()) },
      rules: { title: rulesSection.title, description: rulesSection.description, items: (rulesSection.items || []).filter((r) => r?.title?.trim() && r?.description?.trim()) },
      galleryImages: (formData.galleryImages || []).filter((g) => String(g?.imageUrl || g?.url || "").trim()),
      sponsors,
      questionsAnswers: (formData.questionsAnswers || []).filter((q) => q?.question?.trim() && q?.answer?.trim()),
      cardImages: { title: rawCard.title, description: rawCard.description, Images: (rawCard.Images || []).filter((img) => String(img?.imageUrl || img?.url || "").trim()) },
      showTrialLocations: formData.showTrialLocations || false,
      showRegistrationForm: formData.showRegistrationForm || false,
      showTeamRegistration: formData.showTeamRegistration || false,
      contactInfo: formData.contactInfo || { email: "", mobileNumber: "", phoneNumber: "", website: "" },
      socialAccounts: formData.socialAccounts || [],
      isActive: formData.isActive,
      metaTitle: formData.metaTitle || "", metaDescription: formData.metaDescription || "", metaKeywords: formData.metaKeywords || "",
    };
  };

  const extractLandingPageId = (response, fallbackId = null) => {
    const payload = response?.data;
    return (
      payload?.data?.landingPage?._id ||
      payload?.data?.landingPage?.id ||
      payload?.data?._id ||
      payload?.landingPage?._id ||
      fallbackId ||
      null
    );
  };

  const isApiSuccess = (response) => {
    if (!response?.data) return false;
    if (response.data.success === false) return false;
    return response.status >= 200 && response.status < 300;
  };

  const saveBasicInfoAndContact = async ({ showSuccessToast = true } = {}) => {
    if (!formData.tournamentTitle?.trim()) { toast.error("Tournament Title is required"); return false; }
    if (!formData.tournamentName?.trim()) { toast.error("Tournament Name is required"); return false; }
    if (!hasRichTextContent(formData.description)) { toast.error("Description is required"); return false; }
    setIsSavingBasicInfo(true);
    try {
      const apiData = buildBasicInfoPayload();
      let response;
      if (landingPageId) {
        response = await api.put(`/webSiteApi/auctionLandingPage/auctionLandingPage/${landingPageId}/unifiedUpdate`, apiData);
      } else {
        response = await api.post("/webSiteApi/auctionLandingPage/auctionLandingPage/create", apiData);
      }
      if (isApiSuccess(response)) {
        let newId = extractLandingPageId(response, landingPageId);
        if (!newId && !landingPageId) {
          try {
            const refetch = await api.get(`/webSiteApi/auctionLandingPage/auctionLandingPage?tournamentId=${tournamentId}&auctionId=${auctionId}&includeInactive=true`);
            newId = refetch.data?.data?.landingPage?._id || null;
          } catch (refetchError) {
            console.error(refetchError);
          }
        }
        if (newId) {
          setLandingPageId(newId);
          setIsBasicInfoSaved(true);
          if (showSuccessToast) {
            toast.success("Basic info saved! All tabs are now unlocked.");
          }
          return true;
        }
      }
      toast.error(response.data?.message || "Failed to save basic info");
      return false;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save basic info");
      return false;
    } finally {
      setIsSavingBasicInfo(false);
    }
  };

  const handleFullSubmit = async () => {
    setLoading(true);
    try {
      if (!formData.tournamentTitle || !formData.tournamentName || !hasRichTextContent(formData.description)) {
        toast.error("Please fill tournament title, name, and description");
        return;
      }
      if (!isBasicInfoSaved && !landingPageId) {
        const saved = await saveBasicInfoAndContact();
        if (!saved) return;
      }
      const apiData = buildCompletePayload();
      let response;
      if (landingPageId) {
        response = await api.put(`/webSiteApi/auctionLandingPage/auctionLandingPage/${landingPageId}/unifiedUpdate`, apiData);
      } else {
        response = await api.post("/webSiteApi/auctionLandingPage/auctionLandingPage/create", apiData);
      }
      if (response.data.success) {
        toast.success(landingPageId ? "Landing page updated!" : "Landing page created!");
        const newId = extractLandingPageId(response, landingPageId);
        if (newId) {
          setLandingPageId(newId);
          setIsBasicInfoSaved(true);
        }
        await fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (field, file, index = null) => {
    if (!file) return;
    if (!isBasicInfoSaved && !landingPageId) {
      toast.warning("Please save Basic Info first before uploading images");
      return;
    }
    try {
      const pageId = landingPageId;
      if (!pageId) { toast.error("Landing page not found. Please save basic info first."); return; }
      const formDataUpload = new FormData();
      let endpoint = "";
      if (field === "sliderImages") { formDataUpload.append("sliderImages", file); endpoint = `/webSiteApi/auctionLandingPage/auctionLandingPage/${pageId}/uploadSliderImages`; }
      else if (field === "galleryImages") { formDataUpload.append("galleryImages", file); endpoint = `/webSiteApi/auctionLandingPage/auctionLandingPage/${pageId}/uploadGalleryImages`; }
      else if (field === "sponsors") { formDataUpload.append("sponsorLogo", file); endpoint = `/webSiteApi/auctionLandingPage/auctionLandingPage/${pageId}/uploadSponsorLogos`; }
      else if (field === "cardImages") { formDataUpload.append("cardImages", file); endpoint = `/webSiteApi/auctionLandingPage/auctionLandingPage/${pageId}/uploadCardImages`; }
      const response = await api.post(endpoint, formDataUpload);
      if (response.data.success) {
        if (field === "sliderImages") setFormData((prev) => ({ ...prev, sliderImages: response.data.data.sliderImages }));
        else if (field === "galleryImages") setFormData((prev) => ({ ...prev, galleryImages: response.data.data.galleryImages }));
        else if (field === "sponsors") {
          setFormData((prev) => {
            const currentSponsors = [...(prev.sponsors || [])];
            const uploadedSponsors = Array.isArray(response.data.data.sponsors)
              ? response.data.data.sponsors
              : [];
            const uploadedSponsor =
              uploadedSponsors[index] ||
              uploadedSponsors[uploadedSponsors.length - 1] ||
              response.data.data.sponsor ||
              {};

            if (index !== null && currentSponsors[index]) {
              currentSponsors[index] = {
                ...uploadedSponsor,
                ...currentSponsors[index],
                logo:
                  uploadedSponsor.logo ||
                  uploadedSponsor.url ||
                  currentSponsors[index].logo ||
                  currentSponsors[index].url ||
                  "",
              };
            } else if (uploadedSponsors.length) {
              uploadedSponsors.forEach((sponsor, sponsorIndex) => {
                currentSponsors[sponsorIndex] = {
                  ...sponsor,
                  ...(currentSponsors[sponsorIndex] || {}),
                  logo:
                    sponsor.logo ||
                    sponsor.url ||
                    currentSponsors[sponsorIndex]?.logo ||
                    currentSponsors[sponsorIndex]?.url ||
                    "",
                };
              });
            }

            return { ...prev, sponsors: currentSponsors };
          });
        }
        else if (field === "cardImages") setFormData((prev) => ({ ...prev, cardImages: response.data.data.cardImages }));
        toast.success(`${field} uploaded successfully`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload failed");
    }
  };

  const handleInputChange = (section, field, value, index = null, subField = null) => {
    setFormData((prev) => {
      const updated = structuredClone(prev);
      if (index !== null && subField) {
        if (section) updated[section][field][index][subField] = value;
        else updated[field][index][subField] = value;
      } else if (section) {
        updated[section][field] = value;
      } else {
        updated[field] = value;
      }
      return updated;
    });
    const fieldKey = section ? `${section}.${field}` : field;
    markFieldAsTouched(fieldKey);
  };

  const handleArrayAdd = (section, field) => {
    setFormData((prev) => {
      const updated = structuredClone(prev);
      const getTemplate = () => {
        if (field === "features") return { title: "", description: "", icon: "tv", order: (formData.keyFeatures?.features?.length || 0) + 1 };
        if (field === "items") return { title: "", description: "", order: (formData.rules?.items?.length || 0) + 1 };
        if (field === "sponsors") return { name: "", logo: "", website: "", tier: "partner", order: (formData.sponsors?.length || 0) + 1 };
        if (field === "questionsAnswers") return { question: "", answer: "", category: "", order: (formData.questionsAnswers?.length || 0) + 1 };
        if (field === "Images") return { imageUrl: "", title: "", description: "", order: formData.cardImages?.Images?.length || 0 };
        if (field === "socialAccounts") return { platform: "instagram", url: "" };
        if (field === "sliderImages") return { imageUrl: "", title: "", description: "", order: formData.sliderImages?.length || 0 };
        if (field === "galleryImages") return { imageUrl: "", title: "", description: "", order: formData.galleryImages?.length || 0 };
        return {};
      };
      if (section) {
        if (!updated[section]) updated[section] = {};
        if (!Array.isArray(updated[section][field])) updated[section][field] = [];
        updated[section][field].push(getTemplate());
      } else {
        if (!Array.isArray(updated[field])) updated[field] = [];
        updated[field].push(getTemplate());
      }
      return updated;
    });
  };

  const handleArrayRemove = (section, field, index) => {
    setFormData((prev) => {
      const updated = structuredClone(prev);
      const target = section ? updated[section][field] : updated[field];
      if (Array.isArray(target)) target.splice(index, 1);
      return updated;
    });
  };

  const goToNextStep = async () => {
    if (activeStep === 0) {
      if (isSavingBasicInfo) return;
      if (!isBasicInfoSaved || !landingPageId) {
        toast.info("Saving basic info...");
      }
      const saved = await saveBasicInfoAndContact({ showSuccessToast: true });
      if (!saved) return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const socialPlatforms = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "youtube", label: "YouTube" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
  ];

  const currentStep = steps[activeStep];
  const currentStepId = currentStep.id;
  const isCurrentStepLocked = isStepLocked(currentStepId);

  return (
    <div className="lp-root">
      {loading && (
        <div className="lp-overlay">
          <div className="lp-overlay-card">
            <FiLoader className="lp-spinner" size={24} />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* ── Sticky Header ───────────────────────────── */}
      <div className="lp-sticky-header">
        <div className="lp-header-inner">

          {/* Title row */}
          <div className="lp-title-row">
            <div>
              <h1 className="lp-main-title">Landing Page Builder</h1>
              {/* <p className="lp-main-subtitle">
                {isBasicInfoSaved
                  ? `Editing: ${formData.tournamentTitle || "Tournament"}`
                  : "Fill Basic Info and save to unlock all sections"}
              </p> */}
            </div>
            <div className="lp-title-badges">
              {isBasicInfoSaved && (
                <span className="lp-badge lp-badge-success">● Live</span>
              )}
              {!isBasicInfoSaved && (
                <span className="lp-badge lp-badge-warning">Setup required</span>
              )}
            </div>
          </div>

          {/* Tab bar */}
          <div className="lp-tabs-wrapper">
            <div className="lp-tabs">
              {steps.map((step, idx) => {
                const isCurrent = idx === activeStep;
                const hasError = getStepErrorStatus(step.id);
                const isLocked = isStepLocked(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (isLocked) { toast.info("Fill Basic Info and click Next to unlock all tabs"); return; }
                      setActiveStep(idx);
                    }}
                    disabled={isLocked}
                    title={step.description}
                    className={`lp-tab ${isCurrent ? "lp-tab-active" : ""} ${hasError ? "lp-tab-error" : ""} ${isLocked ? "lp-tab-locked" : ""}`}
                  >
                    <span className="lp-tab-icon">
                      {isLocked ? <FiLock size={13} /> : step.icon}
                    </span>
                    <span className="lp-tab-label">{step.label}</span>
                    {hasError && !isLocked && <span className="lp-tab-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step meta */}
          <div className="lp-step-meta">
            <span className="lp-step-badge">{activeStep + 1} / {steps.length}</span>
            <span className="lp-step-desc">{currentStep.description}</span>
            {!isBasicInfoSaved && !landingPageId && currentStepId !== "registration" && (
              <span className="lp-badge lp-badge-warning">
                <FiLock size={10} /> Save Basic Info first
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────── */}
      <div className="lp-body">
        <div className="lp-content-card">

          {/* ─ Basic Info ─ */}
          {currentStepId === "registration" && (
            <div className="lp-section-fade">
              <SectionHeader
                title="Tournament Details"
                description="These three fields are required before any other section can be configured. Click Next to save and unlock the remaining tabs."
              />

              <div className="lp-grid-2">
                <Field label="Tournament Title *" hint="The prominent display title shown at the top of the landing page.">
                  <input
                    type="text"
                    value={formData.tournamentTitle}
                    onChange={(e) => handleInputChange(null, "tournamentTitle", e.target.value)}
                    className="lp-input"
                    placeholder="e.g. Champions Cup 2026"
                  />
                </Field>
                <Field label="Tournament Name *" hint="The official registered name of the tournament.">
                  <input
                    type="text"
                    value={formData.tournamentName}
                    onChange={(e) => handleInputChange(null, "tournamentName", e.target.value)}
                    className="lp-input"
                    placeholder="e.g. ICC Champions Trophy"
                  />
                </Field>
              </div>

              <Field label=" Description *" hint="A concise overview shown beneath the title.">
                <CKEditor
                  editor={ClassicEditor}
                  config={shortDescriptionEditorConfig}
                  data={formData.description}
                  onChange={(_, editor) => handleInputChange(null, "description", editor.getData())}
                  onBlur={() => markFieldAsTouched("description")}
                />
              </Field>

              <div className="lp-divider-section">
                <h3 className="lp-sub-title">Display Options</h3>
                <p className="lp-sub-desc">Control which additional sections appear on the public landing page.</p>
                <div className="lp-toggle-grid">
                  {TrialType && (
                    <label className="lp-toggle-card">
                      <div>
                        <span className="lp-toggle-name">Trial Locations</span>
                        <span className="lp-toggle-hint">Show venue selection map</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.showTrialLocations}
                        onChange={(e) => handleInputChange(null, "showTrialLocations", e.target.checked)}
                        className="lp-checkbox"
                      />
                    </label>
                  )}
                  <label className="lp-toggle-card">
                    <div>
                      <span className="lp-toggle-name">Registration Form</span>
                      <span className="lp-toggle-hint">Enable individual sign-ups</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showRegistrationForm}
                      onChange={(e) => handleInputChange(null, "showRegistrationForm", e.target.checked)}
                      className="lp-checkbox"
                    />
                  </label>
                  <label className="lp-toggle-card">
                    <div>
                      <span className="lp-toggle-name">Team Registration</span>
                      <span className="lp-toggle-hint">Enable team-based sign-ups</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showTeamRegistration}
                      onChange={(e) => handleInputChange(null, "showTeamRegistration", e.target.checked)}
                      className="lp-checkbox"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ─ Contact ─ */}
          {currentStepId === "header" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Contact Information"
                  description="This information appears in the contact section of the landing page and helps visitors reach you."
                />
                <div className="lp-grid-2">
              <Field label="Mobile Number" hint="Primary contact number for visitors.">
                <input type="tel" inputMode="numeric" pattern="[0-9]*"  value={formData.contactInfo?.mobileNumber ?? ""} onChange={(e) => handleInputChange("contactInfo", "mobileNumber", digitsOnly(e.target.value))} className="lp-input" placeholder="919876543210" />
              </Field>
                  <Field label="Email Address" hint="Enquiry or support email address.">
                    <input type="email" value={formData.contactInfo?.email ?? ""} onChange={(e) => handleInputChange("contactInfo", "email", e.target.value)} className="lp-input" placeholder="contact@tournament.com" />
                  </Field>
              <Field label="Phone Number" hint="Alternate landline or office number.">
                <input type="tel" inputMode="numeric" pattern="[0-9]*" value={formData.contactInfo?.phoneNumber ?? ""} onChange={(e) => handleInputChange("contactInfo", "phoneNumber", digitsOnly(e.target.value))} className="lp-input" placeholder="02212345678" />
              </Field>
                  <Field label="Website" hint="Official tournament or organization website.">
                    <input type="text"  value={formData.contactInfo?.website ?? ""} onChange={(e) => handleInputChange("contactInfo", "website", e.target.value)} className="lp-input" placeholder="https://tournament.com" />
                  </Field>
                </div>

                <div className="lp-divider-section">
                  <div className="lp-section-header">
                    <div>
                      <h3 className="lp-sub-title">Social Accounts</h3>
                      <p className="lp-sub-desc">Add links to your social media profiles. These appear as icons on the page.</p>
                    </div>
                    <button onClick={() => handleArrayAdd(null, "socialAccounts")} className="lp-btn-outline">
                      <FiPlus size={14} /> Add Account
                    </button>
                  </div>
                  {formData.socialAccounts?.length === 0 && <EmptyState message="No social accounts added yet. Click 'Add Account' to get started." />}
                  {formData.socialAccounts?.map((acc, idx) => (
                    <div key={idx} className="lp-row-card">
                      <select value={acc.platform ?? ""} onChange={(e) => handleInputChange(null, "socialAccounts", e.target.value, idx, "platform")} className="lp-input lp-select lp-row-select">
                        {socialPlatforms.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      <input value={acc.url ?? ""} onChange={(e) => handleInputChange(null, "socialAccounts", e.target.value, idx, "url")} className="lp-input lp-row-input" placeholder="https://..." />
                      <button onClick={() => handleArrayRemove(null, "socialAccounts", idx)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ─ Slider ─ */}
          {currentStepId === "slider" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Slider Images"
                  description="These images rotate as a hero banner at the top of the landing page. Use high-quality landscape images (recommended: 1920×600px)."
                  action={
                    <button onClick={() => handleArrayAdd(null, "sliderImages")} className="lp-ui-btn-secondary">
                      <FiPlus size={14} /> Add Slide
                    </button>
                  }
                />
                {formData.sliderImages?.length === 0 && <EmptyState message="No slides added yet. Click 'Add Slide' to get started." />}
                <div className="lp-image-grid">
                  {formData.sliderImages?.map((slide, i) => (
                    <div key={i} className="lp-image-card">
                      <div className="lp-image-card-header">
                        <span className="lp-image-card-num">Slide {i + 1}</span>
                        <button onClick={() => handleArrayRemove(null, "sliderImages", i)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={14} /></button>
                      </div>
                      {(slide.imageUrl || slide.url) ? (
                        <img src={slide.imageUrl || slide.url} className="lp-image-preview" alt={`Slide ${i + 1}`} />
                      ) : (
                        <div className="lp-image-placeholder">No image uploaded</div>
                      )}
                      <label className="lp-upload-zone">
                        <FiUpload size={15} /> Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("sliderImages", e.target.files[0], i)} />
                      </label>
                      <input placeholder="Slide title (optional)" value={slide.title ?? ""} onChange={(e) => handleInputChange(null, "sliderImages", e.target.value, i, "title")} className="lp-input lp-input-sm" />
                      <textarea placeholder="Caption (optional)" rows={2} value={slide.description ?? ""} onChange={(e) => handleInputChange(null, "sliderImages", e.target.value, i, "description")} className="lp-input lp-textarea lp-input-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ─ Key Features ─ */}
          {currentStepId === "keyFeatures" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Key Features"
                  description="Highlight the most compelling aspects of this tournament. Each feature card shows an icon, title, and short description."
                  action={
                    <button onClick={() => handleArrayAdd("keyFeatures", "features")} className="lp-ui-btn-secondary">
                      <FiPlus size={14} /> Add Feature
                    </button>
                  }
                />
                <Field label="Section Title" hint="Heading shown above the features grid on the page.">
                  <input value={formData.keyFeatures.title ?? ""} onChange={(e) => handleInputChange("keyFeatures", "title", e.target.value)} className="lp-input" placeholder="Key Features" />
                </Field>
                {formData.keyFeatures.features.length === 0 && <EmptyState message="No features added yet. Click 'Add Feature' to get started." />}
                {formData.keyFeatures.features.map((feat, idx) => (
                  <div key={idx} className="lp-list-card">
                    <div className="lp-list-card-header">
                      <span className="lp-list-card-num">Feature {idx + 1}</span>
                      <button onClick={() => handleArrayRemove("keyFeatures", "features", idx)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={14} /></button>
                    </div>
                    <div className="lp-grid-2">
                      <Field label="Title" hint="Short feature name, e.g. 'Live Streaming'">
                        <input value={feat.title ?? ""} onChange={(e) => handleInputChange("keyFeatures", "features", e.target.value, idx, "title")} className="lp-input" placeholder="Feature title" />
                      </Field>
                      <Field label="Description" hint="One or two sentences describing this feature.">
                        <textarea rows={2} value={feat.description ?? ""} onChange={(e) => handleInputChange("keyFeatures", "features", e.target.value, idx, "description")} className="lp-input lp-textarea" placeholder="What makes this feature valuable..." />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ─ Rules ─ */}
          {currentStepId === "rules" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Rules & Guidelines"
                  description="Define the rules that participants must follow. These appear in a structured list on the landing page."
                  action={
                    <button onClick={() => handleArrayAdd("rules", "items")} className="lp-ui-btn-secondary">
                      <FiPlus size={14} /> Add Rule
                    </button>
                  }
                />
                <div className="lp-grid-2">
                  <Field label="Section Title" hint="Heading shown above the rules list.">
                    <input type="text" value={formData?.rules?.title || ""} onChange={(e) => handleInputChange("rules", "title", e.target.value)} className="lp-input" placeholder="Rules & Guidelines" />
                  </Field>
                  <Field label="Section Description" hint="Short introductory text for the rules section.">
                    <input type="text" value={formData?.rules?.description || ""} onChange={(e) => handleInputChange("rules", "description", e.target.value)} className="lp-input" placeholder="Please read all rules carefully before registering." />
                  </Field>
                </div>
                {(formData?.rules?.items || []).length === 0 && <EmptyState message="No rules added yet. Click 'Add Rule' to create one." />}
                {formData?.rules?.items?.map((rule, index) => (
                  <div key={index} className="lp-list-card">
                    <div className="lp-list-card-header">
                      <span className="lp-list-card-num">Rule {index + 1}</span>
                      <button onClick={() => handleArrayRemove("rules", "items", index)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={14} /></button>
                    </div>
                    <div className="lp-grid-2">
                      <Field label="Rule Title" hint="Short heading for this rule.">
                        <input type="text" value={rule.title || ""} onChange={(e) => handleInputChange("rules", "items", e.target.value, index, "title")} className="lp-input" placeholder="e.g. Eligibility Criteria" />
                      </Field>
                      <Field label="Display Order" hint="Lower numbers appear first in the list.">
                        <input type="number" min="1" value={rule.order ?? index + 1} onChange={(e) => handleInputChange("rules", "items", parseInt(e.target.value), index, "order")} className="lp-input" />
                      </Field>
                    </div>
                    <Field label="Description" hint="Full explanation of this rule.">
                      <textarea value={rule.description || ""} onChange={(e) => handleInputChange("rules", "items", e.target.value, index, "description")} className="lp-input lp-textarea" rows={3} placeholder="Detailed rule explanation..." />
                    </Field>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ─ Sponsors ─ */}
          {currentStepId === "sponsors" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Sponsors & Partners"
                  description="Showcase tournament sponsors with their logo, tier, and website link. Logos appear in a grid grouped by tier."
                  action={
                    <button onClick={() => handleArrayAdd(null, "sponsors")} className="lp-ui-btn-secondary">
                      <FiPlus size={14} /> Add Sponsor
                    </button>
                  }
                />
                {formData?.sponsors?.length === 0 && <EmptyState message="No sponsors added yet. Click 'Add Sponsor' to get started." />}
                {formData?.sponsors?.map((sponsor, index) => (
                  <div key={index} className="lp-list-card">
                    <div className="lp-list-card-header">
                      <span className="lp-list-card-num">Sponsor {index + 1}</span>
                      {(formData?.sponsors?.length || 0) > 1 && (
                        <button onClick={() => handleArrayRemove(null, "sponsors", index)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={14} /></button>
                      )}
                    </div>
                    <div className="lp-sponsor-layout">
                      <div className="lp-sponsor-logo">
                        {sponsor.logo || sponsor.url ? (
                          <img src={sponsor.logo || sponsor.url} alt={sponsor.name || "Logo"} className="lp-sponsor-img" />
                        ) : (
                          <label className="lp-upload-zone lp-upload-zone-tall">
                            <FiUpload size={18} />
                            <span>Upload Logo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("sponsors", e.target.files[0], index)} />
                          </label>
                        )}
                      </div>
                      <div className="lp-sponsor-fields">
                        <div className="lp-grid-2">
                          <Field label="Sponsor Name" hint="Company or organization name.">
                            <input type="text" value={sponsor.name ?? ""} onChange={(e) => handleInputChange(null, "sponsors", e.target.value, index, "name")} className="lp-input" placeholder="Acme Corp" />
                          </Field>
                          <Field label="Website" hint="Sponsor's official website URL.">
                            <input type="url" value={sponsor.website ?? ""} onChange={(e) => handleInputChange(null, "sponsors", e.target.value, index, "website")} className="lp-input" placeholder="https://acme.com" />
                          </Field>
                          <Field label="Tier" hint="Sponsorship level for display grouping.">
                            <select value={sponsor.tier ?? ""} onChange={(e) => handleInputChange(null, "sponsors", e.target.value, index, "tier")} className="lp-input lp-select">
                              <option value="platinum" >Platinum</option>
                              <option value="gold">Gold</option>
                              <option value="silver">Silver</option>
                              <option value="bronze">Bronze</option>
                              <option value="partner">Partner</option>
                            </select>
                          </Field>
                          <Field label="Display Order" hint="Order within the sponsor tier group.">
                            <input type="number" min="1" value={sponsor.order ?? "" } onChange={(e) => handleInputChange(null, "sponsors", parseInt(e.target.value), index, "order")} className="lp-input" />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ─ Gallery ─ */}
          {currentStepId === "gallery" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Photo Gallery"
                  description="Upload photos from past events or promotional images. These appear in a grid gallery section on the page."
                  action={
                    <button onClick={() => handleArrayAdd(null, "galleryImages")} className="lp-ui-btn-secondary">
                      <FiPlus size={14} /> Add Photo
                    </button>
                  }
                />
                {formData.galleryImages?.length === 0 && <EmptyState message="No gallery photos added yet. Click 'Add Photo' to get started." />}
                <div className="lp-image-grid">
                  {formData.galleryImages?.map((img, i) => (
                    <div key={i} className="lp-image-card">
                      <div className="lp-image-card-header">
                        <span className="lp-image-card-num">Photo {i + 1}</span>
                        <button onClick={() => handleArrayRemove(null, "galleryImages", i)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={14} /></button>
                      </div>
                      {(img.imageUrl || img.url) ? (
                        <img src={img.imageUrl || img.url} className="lp-image-preview" alt={`Gallery ${i + 1}`} />
                      ) : (
                        <div className="lp-image-placeholder">No image uploaded</div>
                      )}
                      <label className="lp-upload-zone">
                        <FiUpload size={15} /> Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("galleryImages", e.target.files[0], i)} />
                      </label>
                      <input placeholder="Photo title (optional)" value={img.title} onChange={(e) => handleInputChange(null, "galleryImages", e.target.value, i, "title")} className="lp-input lp-input-sm" />
                      <textarea placeholder="Caption (optional)" rows={2} value={img.description} onChange={(e) => handleInputChange(null, "galleryImages", e.target.value, i, "description")} className="lp-input lp-textarea lp-input-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ─ Card Images ─ */}
          {currentStepId === "cardImages" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Guest Gallery"
                  description="Featured image cards displayed in a prominent section. Ideal for highlighting VIPs, celebrities, or key participants."
                  action={
                    <button onClick={() => handleArrayAdd("cardImages", "Images")} className="lp-ui-btn-secondary">
                      <FiPlus size={14} /> Add Card
                    </button>
                  }
                />
                {formData.cardImages?.Images?.length === 0 && <EmptyState message="No guest cards added yet. Click 'Add Card' to get started." />}
                <div className="lp-image-grid">
                  {formData.cardImages?.Images?.map((img, i) => (
                    <div key={i} className="lp-image-card">
                      <div className="lp-image-card-header">
                        <span className="lp-image-card-num">Card {i + 1}</span>
                        <button onClick={() => handleArrayRemove("cardImages", "Images", i)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={14} /></button>
                      </div>
                      {(img.imageUrl || img.url) ? (
                        <img src={img.imageUrl || img.url} className="lp-image-preview" alt={`Card ${i + 1}`} />
                      ) : (
                        <div className="lp-image-placeholder">No image uploaded</div>
                      )}
                      <label className="lp-upload-zone">
                        <FiUpload size={15} /> Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange("cardImages", e.target.files[0], i)} />
                      </label>
                      <input placeholder="Name or title" value={img.title} onChange={(e) => handleInputChange("cardImages", "Images", e.target.value, i, "title")} className="lp-input lp-input-sm" />
                      <textarea placeholder="Description" rows={2} value={img.description} onChange={(e) => handleInputChange("cardImages", "Images", e.target.value, i, "description")} className="lp-input lp-textarea lp-input-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ─ FAQ ─ */}
          {currentStepId === "faqs" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="Frequently Asked Questions"
                  description="Address common participant queries upfront. FAQs reduce support load and build confidence in registering."
                  action={
                    <button onClick={() => handleArrayAdd(null, "questionsAnswers")} className="lp-ui-btn-secondary">
                      <FiPlus size={14} /> Add FAQ
                    </button>
                  }
                />
                {formData?.questionsAnswers?.length === 0 && <EmptyState message="No FAQs added yet. Click 'Add FAQ' to create one." />}
                {formData?.questionsAnswers?.map((faq, index) => (
                  <div key={index} className="lp-list-card">
                    <div className="lp-list-card-header">
                      <span className="lp-list-card-num">Question {index + 1}</span>
                      <button onClick={() => handleArrayRemove(null, "questionsAnswers", index)} className="lp-icon-btn lp-icon-btn-danger"><FiTrash2 size={14} /></button>
                    </div>
                    <Field label="Question" hint="Phrase it the way a participant would ask it.">
                      <input type="text" value={faq.question ?? ""} onChange={(e) => handleInputChange(null, "questionsAnswers", e.target.value, index, "question")} className="lp-input" placeholder="What are the eligibility criteria?" />
                    </Field>
                    <Field label="Answer" hint="Clear and concise answer. Markdown formatting is not supported.">
                      <textarea value={faq.answer ?? ""} onChange={(e) => handleInputChange(null, "questionsAnswers", e.target.value, index, "answer")} className="lp-input lp-textarea" rows={3} placeholder="Provide a thorough, easy-to-understand answer..." />
                    </Field>
                    <div className="lp-grid-2">
                      <Field label="Category" hint="Optional grouping label (e.g. 'Registration', 'Prizes').">
                        <input type="text" value={faq.category ?? "" } onChange={(e) => handleInputChange(null, "questionsAnswers", e.target.value, index, "category")} className="lp-input" placeholder="e.g. Registration" />
                      </Field>
                      <Field label="Display Order" hint="Lower numbers appear first.">
                        <input type="number" value={faq.order ?? ""} onChange={(e) => handleInputChange(null, "questionsAnswers", parseInt(e.target.value), index, "order")} className="lp-input"  />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ─ SEO ─ */}
          {currentStepId === "meta" && (
            isCurrentStepLocked ? <LockedState onGoToBasicInfo={() => setActiveStep(0)} /> : (
              <div className="lp-section-fade">
                <SectionHeader
                  title="SEO & Visibility"
                  description="Meta tags control how the landing page appears in search engine results and when shared on social media."
                />
                <Field label="Meta Title" hint="Shown in browser tabs and search results. Keep under 60 characters for best results.">
                  <input value={formData.metaTitle} onChange={(e) => handleInputChange(null, "metaTitle", e.target.value)} maxLength="60" className="lp-input" placeholder="Champions Cup 2026 – Official Page" />
                  <span className={`lp-char-count ${formData.metaTitle.length > 55 ? "lp-char-warn" : ""}`}>{formData.metaTitle.length} / 60</span>
                </Field>
                <Field label="Meta Description" hint="Appears beneath the title in search results. Aim for 120–160 characters.">
                  <textarea rows={3} value={formData.metaDescription} onChange={(e) => handleInputChange(null, "metaDescription", e.target.value)} maxLength="160" className="lp-input lp-textarea" placeholder="Join the premier cricket tournament of 2026. Register your team now..." />
                  <span className={`lp-char-count ${formData.metaDescription.length > 150 ? "lp-char-warn" : ""}`}>{formData.metaDescription.length} / 160</span>
                </Field>
                <Field label="Meta Keywords" hint="Comma-separated keywords. Less critical for modern SEO, but still useful for some search engines.">
                  <input value={formData.metaKeywords} onChange={(e) => handleInputChange(null, "metaKeywords", e.target.value)} className="lp-input" placeholder="cricket tournament, champions cup, 2026" />
                </Field>
                <div className="lp-toggle-card lp-toggle-card-wide">
                  <div>
                    <span className="lp-toggle-name">Page Active</span>
                    <span className="lp-toggle-hint">When enabled, the landing page is publicly accessible. Disable to take it offline without deleting content.</span>
                  </div>
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => handleInputChange(null, "isActive", e.target.checked)} className="lp-checkbox" />
                </div>
              </div>
            )
          )}
        </div>

        <div className="lp-footer-spacer" />
      </div>

      {/* ── Bottom Action Bar ────────────────────────── */}
      <div className="lp-action-bar">
        <div className="lp-action-inner">
          <div className="lp-action-nav">
            <button onClick={goToPrevStep} disabled={activeStep === 0} className={`lp-btn-nav ${activeStep === 0 ? "lp-btn-nav-disabled" : ""}`}>
              <FiChevronLeft size={15} /> Prev
            </button>
            {activeStep < steps.length - 1 && (
              <button
                onClick={goToNextStep}
                disabled={isSavingBasicInfo}
                className={`lp-btn-nav lp-btn-nav-next ${isSavingBasicInfo ? "lp-btn-nav-disabled" : ""}`}
              >
                {isSavingBasicInfo && activeStep === 0 ? (
                  <>
                    <FiLoader className="lp-spin" size={15} /> Saving...
                  </>
                ) : (
                  <>
                    Next <FiChevronRight size={15} />
                  </>
                )}
              </button>
            )}
            <button onClick={handleFullSubmit} className="lp-btn-save">
              <FiSave size={14} /> Save All
            </button>
          </div>

          <div className="lp-action-aux">
            {currentStepId === "registration" && !isBasicInfoSaved && !landingPageId && (
              <button onClick={saveBasicInfoAndContact} disabled={isSavingBasicInfo} className="lp-btn-setup">
                {isSavingBasicInfo ? <FiLoader className="lp-spin" size={13} /> : <FiSave size={13} />}
                Save Basic Info
              </button>
            )}
            <button onClick={() => navigate(`/landing-page/${tournamentId}/${auctionId}`)} className="lp-btn-view">
              <FiEye size={14} /> Preview
            </button>
            <button onClick={() => setShowBarcodeModal(true)} disabled={!landingPageId} className="lp-btn-barcode">
              QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Modal */}
      {showBarcodeModal && (
        <div className="lp-modal-overlay">
          <div className="lp-modal">
            <button onClick={() => setShowBarcodeModal(false)} className="lp-modal-close">
              <FiX size={16} />
            </button>
            <BarcodeShareAdmin
              tournamentId={tournamentId}
              auctionId={auctionId}
              tournamentName={formData?.tournamentName}
              city={formData?.contactInfo?.city || ""}
            />
          </div>
        </div>
      )}

      {/* ── Styles ──────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        .lp-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f5f5f7;
          min-height: 100vh;
          color: #1a1a2e;
          font-size: 14px;
        }

        /* ── Overlay ── */
        .lp-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 9999;
        }
        .lp-overlay-card {
          background: #fff; border-radius: 16px; padding: 20px 28px;
          display: flex; align-items: center; gap: 12px;
          font-weight: 500; color: #374151; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .lp-spinner { animation: spin 0.8s linear infinite; color: #4f46e5; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Sticky Header ── */
        .lp-sticky-header {
          position: sticky; top: 0; z-index: 40;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 12px rgba(0,0,0,0.06);
        }
        .lp-header-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 14px 20px 0;
        }

        /* Title row */
        .lp-title-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
          margin-bottom: 14px;
        }
        .lp-main-title {
          font-size: 22px; font-weight: 600; letter-spacing: -0.4px;
          color: #111827; line-height: 1.2; margin: 0;
        }
        .lp-main-subtitle {
          font-size: 13px; color: #6b7280; margin: 3px 0 0;
        }
        .lp-title-badges { display: flex; gap: 6px; align-items: center; padding-top: 2px; }

        /* Badges */
        .lp-badge {
          font-size: 11px; font-weight: 500; padding: 3px 10px;
          border-radius: 99px; letter-spacing: 0.2px;
        }
        .lp-badge-success { background: #d1fae5; color: #065f46; }
        .lp-badge-warning { background: #fef3c7; color: #92400e; }

        /* Tab bar */
        .lp-tabs-wrapper { overflow-x: auto; scrollbar-width: none; }
        .lp-tabs-wrapper::-webkit-scrollbar { display: none; }
        .lp-tabs {
          display: flex; gap: 2px; min-width: max-content;
          padding-bottom: 0;
        }
        .lp-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px 8px 0 0;
          border: none; background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400; color: #6b7280;
          cursor: pointer; white-space: nowrap;
          transition: all 0.15s; position: relative;
          border-bottom: 2px solid transparent;
        }
        .lp-tab:hover:not(.lp-tab-locked):not(.lp-tab-active) {
          background: #f3f4f6; color: #374151;
        }
        .lp-tab-active {
          color: #4f46e5; font-weight: 500;
          border-bottom-color: #4f46e5;
          background: #eef2ff;
        }
        .lp-tab-locked { color: #c4c7ce; cursor: not-allowed; }
        .lp-tab-error { color: #dc2626; }
        .lp-tab-icon { display: flex; align-items: center; opacity: 0.8; }
        .lp-tab-label { }
        .lp-tab-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #dc2626; flex-shrink: 0;
        }

        /* Step meta */
        .lp-step-meta {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 2px 10px; flex-wrap: wrap;
        }
        .lp-step-badge {
          font-size: 11px; font-weight: 600; color: #4f46e5;
          background: #eef2ff; padding: 2px 10px; border-radius: 99px;
          font-family: 'DM Mono', monospace;
        }
        .lp-step-desc { font-size: 12px; color: #9ca3af; }

        /* ── Body / Content ── */
        .lp-body { max-width: 1100px; margin: 0 auto; padding: 20px; }
        .lp-content-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          padding: 28px 32px;
          min-height: 400px;
        }

        /* Section fade-in */
        .lp-section-fade { animation: fadeUp 0.2s ease; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Section headers */
        .lp-section-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          margin-bottom: 24px;
        }
        .lp-section-title {
          font-size: 18px; font-weight: 600; color: #111827;
          margin: 0; letter-spacing: -0.3px;
        }
        .lp-section-desc {
          font-size: 13.5px; color: #6b7280; margin: 5px 0 0;
          line-height: 1.6; max-width: 580px;
        }
        .lp-sub-title {
          font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 4px;
        }
        .lp-sub-desc {
          font-size: 13px; color: #9ca3af; margin: 0 0 14px;
          line-height: 1.5;
        }
        .lp-divider-section {
          margin-top: 28px; padding-top: 24px;
          border-top: 1px solid #f3f4f6;
        }

        /* Fields */
        .lp-field { margin-bottom: 18px; }
        .lp-label {
          display: block; font-size: 13px; font-weight: 500;
          color: #374151; margin-bottom: 4px;
        }
        .lp-hint {
          font-size: 12px; color: #9ca3af; margin: 0 0 7px;
          line-height: 1.5;
        }
        .lp-input {
          width: 100%; padding: 9px 13px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; 
          color: #edeff2;
          background: #fafafa;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none; box-sizing: border-box;
        }
        .lp-input:focus {
          border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
          background: #fff;
        }
        .lp-input::placeholder { color: #d1d5db; }
        .lp-textarea { resize: vertical; min-height: 80px; }
        .lp-input-sm { font-size: 13px; padding: 7px 11px; }
        .lp-select { appearance: none; cursor: pointer; }
        .lp-root .lp-select option {
          color: #102033 !important;
          background-color: #ffffff !important;
        }
        [data-theme="dark"] .lp-root .lp-select option {
          color: #eef5ff !important;
          background-color: #16243a !important;
        }
        .lp-char-count { font-size: 11px; color: #9ca3af; display: block; margin-top: 4px; }
        .lp-char-warn { color: #f59e0b !important; }

        /* Grids */
        .lp-grid-2 {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        @media (max-width: 640px) { 
          .lp-grid-2 { grid-template-columns: 1fr; }
          .lp-section-header { flex-direction: column; }
        }

        /* Toggle cards */
        .lp-toggle-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .lp-toggle-card {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 14px 16px;
          background: #fafafa; border: 1.5px solid #e5e7eb;
          border-radius: 12px; cursor: pointer;
          transition: border-color 0.15s;
        }
        .lp-toggle-card:hover { border-color: #818cf8; }
        .lp-toggle-card-wide { width: 100%; }
        .lp-toggle-name { display: block; font-size: 13.5px; font-weight: 500; color: #1f2937; }
        .lp-toggle-hint { display: block; font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .lp-checkbox {
          width: 18px; height: 18px; border-radius: 5px;
          accent-color: #4f46e5; cursor: pointer; flex-shrink: 0;
        }

        /* List cards */
        .lp-list-card {
          border: 1.5px solid #e5e7eb; border-radius: 12px;
          padding: 18px 20px; margin-bottom: 14px; background: #fafafa;
        }
        .lp-list-card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .lp-list-card-num {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.5px; color: #4f46e5;
          background: #eef2ff; padding: 3px 10px; border-radius: 6px;
        }

        /* Image grid */
        .lp-image-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .lp-image-card {
          border: 1.5px solid #e5e7eb; border-radius: 12px;
          padding: 14px; background: #fafafa; display: flex;
          flex-direction: column; gap: 10px;
        }
        .lp-image-card-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .lp-image-card-num {
          font-size: 11px; font-weight: 600; color: #6366f1;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .lp-image-preview {
          width: 100%; height: 130px; object-fit: cover;
          border-radius: 8px; border: 1px solid #e5e7eb;
        }
        .lp-image-placeholder {
          width: 100%; height: 130px; background: #f3f4f6;
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; font-size: 12px; color: #d1d5db;
          border: 1.5px dashed #e5e7eb;
        }

        /* Upload zone */
        .lp-upload-zone {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 9px 12px;
          border: 1.5px dashed #c7d2fe; border-radius: 8px;
          cursor: pointer; font-size: 13px; font-weight: 500;
          color: #6366f1; background: #f5f3ff;
          transition: all 0.15s;
        }
        .lp-upload-zone:hover { background: #ede9fe; border-color: #818cf8; }
        .lp-upload-zone-tall { flex-direction: column; height: 100px; }

        /* Sponsor layout */
        .lp-sponsor-layout { display: flex; gap: 16px; align-items: flex-start; }
        .lp-sponsor-logo { width: 140px; flex-shrink: 0; }
        .lp-sponsor-img {
          width: 100%; height: 100px; object-fit: contain;
          border-radius: 8px; border: 1px solid #e5e7eb; padding: 8px;
          background: #fff;
        }
        .lp-sponsor-fields { flex: 1; }
        @media (max-width: 640px) {
          .lp-sponsor-layout { flex-direction: column; }
          .lp-sponsor-logo { width: 100%; }
        }

        /* Row cards (social) */
        .lp-row-card {
          display: flex; gap: 10px; align-items: center;
          margin-bottom: 10px;
        }
        .lp-row-select { width: 140px; flex-shrink: 0; }
        .lp-row-input { flex: 1; }

        /* Buttons */
        .lp-ui-btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: #4f46e5; color: #fff;
          border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          transition: background 0.15s; white-space: nowrap;
        }
        .lp-ui-btn-secondary:hover { background: #4338ca; }
        .lp-btn-outline {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; background: #fff; color: #4f46e5;
          border: 1.5px solid #c7d2fe; border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.15s;
        }
        .lp-btn-outline:hover { background: #eef2ff; }
        .lp-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px; border: none;
          cursor: pointer; flex-shrink: 0; transition: all 0.15s;
        }
        .lp-icon-btn-danger { background: #fef2f2; color: #ef4444; }
        .lp-icon-btn-danger:hover { background: #fee2e2; }

        /* Empty state */
        .lp-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 36px;
          border: 2px dashed #e5e7eb; border-radius: 12px;
          color: #9ca3af; margin: 8px 0 16px;
        }
        .lp-empty-icon {
          width: 36px; height: 36px; background: #f3f4f6;
          border-radius: 10px; display: flex; align-items: center;
          justify-content: center; font-size: 20px; color: #d1d5db;
          margin-bottom: 10px;
        }
        .lp-empty p { font-size: 13px; margin: 0; text-align: center; }

        /* Footer spacer */
        .lp-footer-spacer { height: 80px; }

        /* Action bar */
        .lp-action-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-top: 1px solid #e5e7eb;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.06);
        }
        .lp-action-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 10px 20px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        .lp-action-nav { display: flex; align-items: center; gap: 8px; }
        .lp-action-aux { display: flex; align-items: center; gap: 8px; }

        .lp-btn-nav {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 16px; background: #f3f4f6; color: #374151;
          border: 1.5px solid #e5e7eb; border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          transition: all 0.15s;
        }
        .lp-btn-nav:hover:not(.lp-btn-nav-disabled) { background: #e5e7eb; }
        .lp-btn-nav-disabled { opacity: 0.4; cursor: not-allowed; }
        .lp-btn-nav-next {
          background: #eef2ff; color: #4f46e5; border-color: #c7d2fe;
        }
        .lp-btn-nav-next:hover { background: #e0e7ff; }

        .lp-btn-save {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; background: #059669; color: #fff;
          border: none; border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          transition: background 0.15s;
        }
        .lp-btn-save:hover { background: #047857; }

        .lp-btn-setup {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: #d97706; color: #fff;
          border: none; border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.15s;
        }
        .lp-btn-setup:hover { background: #b45309; }
        .lp-btn-setup:disabled { opacity: 0.6; cursor: not-allowed; }
        .lp-spin { animation: spin 0.8s linear infinite; }

        .lp-btn-view {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: #2563eb; color: #fff;
          border: none; border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.15s;
        }
        .lp-btn-view:hover { background: #1d4ed8; }

        .lp-btn-barcode {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: #7c3aed; color: #fff;
          border: none; border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.15s;
        }
        .lp-btn-barcode:hover { background: #6d28d9; }
        .lp-btn-barcode:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Modal */
        .lp-modal-overlay {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .lp-modal {
          position: relative; background: #fff; border-radius: 20px;
          max-width: 720px; width: 100%; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 80px rgba(0,0,0,0.2);
        }
        .lp-modal-close {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          width: 32px; height: 32px; border-radius: 8px;
          background: #f3f4f6; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #6b7280; transition: all 0.15s;
        }
        .lp-modal-close:hover { background: #e5e7eb; color: #1f2937; }

        /* Responsive */
        @media (max-width: 768px) {
          .lp-content-card { padding: 20px 16px; }
          .lp-header-inner { padding: 12px 16px 0; }
          .lp-body { padding: 16px; }
          .lp-action-inner { padding: 10px 16px; }
          .lp-main-title { font-size: 18px; }
        }
        @media (max-width: 480px) {
          .lp-action-nav, .lp-action-aux { gap: 6px; }
          .lp-btn-nav, .lp-btn-save, .lp-btn-view, .lp-btn-setup, .lp-btn-barcode {
            padding: 7px 11px; font-size: 12px;
          }
        }

        /* ── Admin Theme Overrides ─────────────────── */
        .lp-root {
          font-family: inherit;
          height: calc(100vh - 108px);
          min-height: 560px;
          background: var(--bg-main);
          color: var(--text-primary);
          font-size: 13px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .lp-root * {
          letter-spacing: 0;
        }
        .lp-sticky-header {
          position: sticky;
          top: 0;
          z-index: 30;
          flex: 0 0 auto;
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }
        .lp-header-inner {
          max-width: none;
          padding: 14px 16px 0;
        }
        .lp-title-row {
          margin-bottom: 12px;
        }
        .lp-main-title {
          color: var(--text-primary);
          font-size: 20px;
          line-height: 1.35;
          font-weight: 700;
        }
        .lp-main-subtitle,
        .lp-step-desc,
        .lp-section-desc,
        .lp-sub-desc,
        .lp-hint {
          color: var(--text-secondary);
        }
        .lp-badge {
          border: 1px solid var(--border-primary);
          border-radius: 999px;
          background: var(--accent-light);
          color: var(--primary);
          font-size: 11px;
          font-weight: 700;
        }
        .lp-badge-success,
        .lp-badge-warning {
          background: var(--accent-light);
          color: var(--primary);
        }
        .lp-tabs {
          gap: 6px;
          padding-bottom: 12px;
        }
        .lp-tab {
          min-height: 36px;
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-main);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          padding: 8px 12px;
        }
        .lp-tab:hover:not(.lp-tab-locked):not(.lp-tab-active) {
          border-color: var(--border-primary);
          background: var(--accent-light);
          color: var(--primary);
        }
        .lp-tab-active {
          border-color: var(--border-primary);
          background: var(--secondary);
          color: #102033;
          box-shadow: 0 8px 20px rgba(244, 180, 0, 0.16);
        }
        .lp-tab-locked {
          opacity: 0.55;
          background: var(--secondary-lighter);
          color: var(--text-secondary);
        }
        .lp-tab-dot {
          background: #ef4444;
        }
        .lp-step-meta {
          border-top: 1px solid var(--border-card);
          padding: 10px 0 12px;
        }
        .lp-step-badge {
          background: var(--accent-light);
          color: var(--primary);
          font-family: inherit;
          font-size: 11px;
        }
        .lp-body {
          max-width: none;
          width: 100%;
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 14px 18px 86px;
          scrollbar-gutter: stable;
        }
        .lp-content-card {
          width: 100%;
          min-height: 360px;
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--shadow-card);
          padding: 18px;
        }
        .lp-section-header {
          
          margin-bottom: 16px;
          gap: 12px;
        }
        .lp-section-title {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 700;
        }
        .lp-sub-title {
          color: var(--text-primary);
          font-size: 14px;
        }
        .lp-field {
          margin-bottom: 14px;
        }
        .lp-label {
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .lp-input {
          min-height: 40px;
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-main);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 13px;
          padding: 9px 12px;
          box-shadow: none;
        }
        .lp-input:focus {
          border-color: var(--border-primary);
          background: var(--bg-card);
          box-shadow: none;
        }
        .lp-input::placeholder {
          color: var(--text-secondary);
        }
        .lp-textarea {
          min-height: 84px;
        }
        .lp-char-count {
          color: var(--text-secondary);
        }
        .lp-char-warn {
          color: var(--secondary-strong) !important;
        }
        .lp-toggle-card,
        .lp-list-card,
        .lp-image-card,
        .lp-row-card {
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--secondary-lighter);
          box-shadow: none;
        }
        .lp-toggle-card {
          padding: 12px 14px;
        }
        .lp-toggle-card:hover,
        .lp-list-card:hover,
        .lp-image-card:hover {
          border-color: var(--border-primary);
        }
        .lp-toggle-name {
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
        }
        .lp-toggle-hint {
          color: var(--text-secondary);
          font-size: 11px;
        }
        .lp-checkbox {
          accent-color: var(--secondary);
        }
        .lp-list-card {
          padding: 14px;
          margin-bottom: 12px;
        }
        .lp-list-card-num,
        .lp-image-card-num {
          border-radius: 6px;
          background: var(--accent-light);
          color: var(--primary);
          font-size: 11px;
        }
        .lp-image-grid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .lp-image-preview,
        .lp-image-placeholder,
        .lp-sponsor-img {
          border-color: var(--border-card);
          border-radius: 8px;
          background: var(--bg-main);
        }
        .lp-upload-zone {
          border-color: var(--border-card);
          border-radius: 8px;
          background: var(--bg-main);
          color: var(--primary);
          font-size: 12px;
          font-weight: 700;
        }
        .lp-upload-zone:hover {
          border-color: var(--border-primary);
          background: var(--accent-light);
        }
        .lp-empty {
          border-color: var(--border-card);
          border-radius: 8px;
          background: var(--secondary-lighter);
          color: var(--text-secondary);
          padding: 28px;
        }
        .lp-empty-icon {
          background: var(--accent-light);
          color: var(--primary);
        }
        .lp-ui-btn-secondary,
        .lp-btn-setup,
        .lp-btn-save {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          background: var(--secondary);
          color: #102033;
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          box-shadow: none;
        }
        .lp-ui-btn-secondary:hover,
        .lp-btn-setup:hover,
        .lp-btn-save:hover {
          background: var(--secondary-strong);
        }
        .lp-btn-outline,
        .lp-btn-nav,
        .lp-btn-view,
        .lp-btn-barcode {
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-main);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          box-shadow: none;
        }
        .lp-btn-outline:hover,
        .lp-btn-nav:hover:not(.lp-btn-nav-disabled),
        .lp-btn-view:hover,
        .lp-btn-barcode:hover {
          border-color: var(--border-primary);
          background: var(--accent-light);
          color: var(--primary);
        }
        .lp-btn-nav-next {
          border-color: var(--border-primary);
          background: var(--accent-light);
          color: var(--primary);
        }
        .lp-icon-btn {
          border-radius: 8px;
        }
        .lp-action-bar {
          position: sticky;
          bottom: 0;
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--shadow-card);
          margin-top: 14px;
        }
        .lp-action-inner {
          max-width: none;
          padding: 10px 12px;
        }
        .lp-modal-overlay {
          z-index: 120000;
          background: rgba(0, 0, 0, 0.6);
        }
        .lp-modal {
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-card);
          box-shadow: var(--shadow-card);
        }
        .lp-modal-close {
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-main);
          color: var(--text-primary);
        }
        .lp-modal-close:hover {
          border-color: var(--border-primary);
          background: var(--accent-light);
          color: var(--primary);
        }
        .lp-overlay-card {
          border: 1px solid var(--border-card);
          border-radius: 8px;
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: var(--shadow-card);
        }
        .lp-spinner {
          color: var(--secondary);
        }
        .lp-root .ck-content h1,
        .lp-root .ck-content h2,
        .lp-root .ck-content h3,
        .lp-root .ck-content h4,
        .lp-root .ck-content h5,
        .lp-root .ck-content h6 {
          margin: 0.65rem 0 0.35rem;
          color: var(--text-primary);
          font-weight: 800;
          line-height: 1.25;
        }
        .lp-root .ck-content h1 { font-size: 1.65rem; }
        .lp-root .ck-content h2 { font-size: 1.4rem; }
        .lp-root .ck-content h3 { font-size: 1.2rem; }
        .lp-root .ck-content h4,
        .lp-root .ck-content h5,
        .lp-root .ck-content h6 { font-size: 1rem; }
        .lp-root .ck-content p {
          margin: 0.4rem 0;
        }
        .lp-root .ck-content ul,
        .lp-root .ck-content ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .lp-root .ck-content ul {
          list-style: disc outside;
        }
        .lp-root .ck-content ol {
          list-style: decimal outside;
        }
        .lp-root .ck-content li + li {
          margin-top: 0.2rem;
        }
        .lp-root .ck-content em,
        .lp-root .ck-content i,
        .lp-root .ck-content span[style*="italic"],
        .lp-root .ck-content span[style*="font-style:italic"],
        .lp-root .ck-content span[style*="font-style: italic"] {
          display: inline-block;
          font-synthesis: style !important;
          font-style: oblique 12deg !important;
          transform: skewX(-10deg);
          transform-origin: left bottom;
        }
        .lp-root .ck-content strong,
        .lp-root .ck-content b {
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default TournamentAdminForm;
