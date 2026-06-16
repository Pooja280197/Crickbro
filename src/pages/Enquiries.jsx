import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import api from "../utils/api";
import { FaEdit, FaTasks, FaTrash, FaPlus, FaSearch, FaEye } from "react-icons/fa";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  PhoneCall,
  Sparkles,
  Trophy,
} from "lucide-react";

const SERVICE_FIELDS = [
  { key: "organiseTournament", label: "Organise tournament" },
  { key: "fullTournamentManagement", label: "Full tournament management" },
  { key: "umpire", label: "Umpire" },
  { key: "scorer", label: "Scorer" },
  { key: "liveScoring", label: "Live scoring" },
  { key: "liveMatch", label: "Live match" },
  { key: "liveStreaming", label: "Live streaming" },
  { key: "playerRegistration", label: "Player registration" },
  { key: "participate", label: "Participate" },
  { key: "createAuction", label: "Create auction" },
  { key: "buildTeam", label: "Build team" },
  { key: "ownWebsite", label: "Own website" },
  { key: "groundBooking", label: "Ground booking" },
  { key: "jerseyPrinting", label: "Jersey printing" },
  { key: "trophyAndMedals", label: "Trophy & medals" },
  { key: "sponsorshipManagement", label: "Sponsorship management" },
];

const TOURNAMENT_TYPES = ["cricket", "football", "kabaddi", "other"];
const STATUS_OPTIONS = ["new", "contacted", "in_progress", "converted", "rejected"];
const SOURCE_OPTIONS = ["instagram", "whatsapp", "website", "referral"];

const defaultForm = {
  fullName: "",
  mobile: "",
  email: "",
  location: "",
  tournamentName: "",
  tournamentType: "cricket",
  numberOfTeams: "",
  startDate: "",
  endDate: "",
  services: SERVICE_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: false }), {}),
  customRequirement: "",
  budget: "",
  source: "website",
  preferredContactTime: "",
};

const Enquiries = ({ theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const verifyData = useSelector((state) => state.data.verify);
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(verifyData?.token || token);
  const isManage = location.pathname === '/enquiries/manage';

  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [manage, setManage] = useState({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    search: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [form, setForm] = useState(defaultForm);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [viewingEnquiry, setViewingEnquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingEnquiry, setDeletingEnquiry] = useState(false);
  const activeTab = isManage ? "manage" : "new";
  const selectedServiceCount = Object.values(form.services).filter(Boolean).length;

  const queryParams = useMemo(
    () => ({
      page: manage.page,
      limit: manage.limit,
      search: manage.search,
      status: manage.status,
      startDate: manage.startDate,
      endDate: manage.endDate,
    }),
    [manage.page, manage.limit, manage.search, manage.status, manage.startDate, manage.endDate],
  );

  const fetchEnquiries = async () => {
    if (!isLoggedIn) return;
    setLoadingList(true);
    try {
      const response = await api.get("/webSiteApi/enquiries/list", {
        params: queryParams,
      });
      const data = response?.data?.data;
      setManage((prev) => ({
        ...prev,
        items: data?.items || [],
        total: data?.meta?.total || 0,
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to load enquiries.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isManage) {
      fetchEnquiries();
    }
  }, [isManage, queryParams, isLoggedIn]);

  const changeForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleService = (key) => {
    setForm((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [key]: !prev.services[key],
      },
    }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      toast.error("Please enter full name.");
      return false;
    }
    if (!form.mobile.trim()) {
      toast.error("Please enter mobile number.");
      return false;
    }
    if (!form.tournamentName.trim()) {
      toast.error("Please enter tournament name.");
      return false;
    }
    return true;
  };

  const resetForm = () => setForm(defaultForm);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await api.post("/webSiteApi/enquiries/create", form);
      toast.success("Enquiry submitted successfully.");
      resetForm();
      if (activeTab === "manage") {
        fetchEnquiries();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingEnquiry) return;
    try {
      const payload = { ...editingEnquiry };
      await api.post(`/webSiteApi/enquiries/update/${editingEnquiry._id}`, payload);
      toast.success("Enquiry updated successfully.");
      setEditingEnquiry(null);
      fetchEnquiries();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeletingEnquiry(true);
    try {
      await api.delete(`/webSiteApi/enquiries/delete/${deleteTarget._id}`);
      toast.success("Enquiry deleted successfully.");
      setDeleteTarget(null);
      fetchEnquiries();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingEnquiry(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusTarget || !newStatus) {
      toast.error("Select a valid status.");
      return;
    }
    try {
      await api.post(`/webSiteApi/enquiries/changeStatus/${statusTarget._id}`, {
        status: newStatus,
      });
      toast.success("Status updated successfully.");
      setStatusTarget(null);
      setNewStatus("");
      fetchEnquiries();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed.");
    }
  };

  const openLogin = () => window.dispatchEvent(new Event("openLoginPopup"));

  return (
    <div className="min-h-screen bg-[var(--bg-soft)] text-[var(--text-primary)]">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main className="max-w-7xl mx-auto px-4 py-10">
        {isManage ? (
          <>
            {isLoggedIn ? (
              <>
                <section className="ui-card overflow-hidden mb-10 !p-0">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--secondary-lighter)] px-6 py-5">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-secondary)]">Enquiry management</p>
                      <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Manage enquiries</h2>
                    </div>
                    <button
                      onClick={() => navigate('/enquiries')}
                      className="ui-btn-primary"
                    >
                      <FaPlus className="w-4 h-4" />
                      Create New Enquiry
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-4">
                        <label className="space-y-2 text-sm text-[var(--text-primary)]">
                          Search
                          <input
                            type="search"
                            value={manage.search}
                            onChange={(e) => setManage((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                            className="ui-input"
                            placeholder="Name, email, mobile or tournament"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-[var(--text-primary)]">
                          Status
                          <select
                            className="ui-input"
                            value={manage.status}
                            onChange={(e) => setManage((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                          >
                            <option value="">All statuses</option>
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm text-[var(--text-primary)]">
                          From date
                          <input
                            type="date"
                            value={manage.startDate}
                            onChange={(e) => setManage((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
                            className="ui-input"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-[var(--text-primary)]">
                          To date
                          <input
                            type="date"
                            value={manage.endDate}
                            onChange={(e) => setManage((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))}
                            className="ui-input"
                          />
                        </label>
                      </div>

                      <div className="ui-card-soft">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm text-[var(--text-secondary)]">Showing enquiries</p>
                            <p className="text-lg font-semibold text-[var(--text-primary)]">
                              {manage.total} results • page {manage.page}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 items-center">
                            <button
                              type="button"
                              onClick={() => setManage((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                              disabled={manage.page === 1 || loadingList}
                              className="ui-btn-ghost"
                            >
                              Prev
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setManage((prev) => ({
                                  ...prev,
                                  page: Math.min(prev.page + 1, Math.ceil(prev.total / prev.limit) || 1),
                                }))
                              }
                              disabled={manage.page >= Math.ceil(manage.total / manage.limit) || loadingList}
                              className="ui-btn-ghost"
                            >
                              Next
                            </button>
                            <label className="text-sm text-[var(--text-primary)]">
                              Page size
                              <select
                                value={manage.limit}
                                onChange={(e) => setManage((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                                className="ml-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] px-3 py-2"
                              >
                                {[10, 20, 40].map((value) => (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="ui-card overflow-x-auto !p-0">
                        <table className="min-w-full text-left">
                          <thead className="bg-[var(--secondary-lighter)] text-[var(--text-secondary)] text-sm uppercase tracking-[0.15em]">
                            <tr>
                              <th className="px-4 py-4">Name</th>
                              <th className="px-4 py-4">Contact</th>
                              <th className="px-4 py-4">Tournament</th>
                              <th className="px-4 py-4">Status</th>
                              <th className="px-4 py-4">Created</th>
                              <th className="px-4 py-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingList ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                                  Loading enquiries...
                                </td>
                              </tr>
                            ) : manage.items.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                                  No enquiries found. Adjust filters or refresh.
                                </td>
                              </tr>
                            ) : (
                              manage.items.map((item) => (
                                <tr key={item._id} className="border-t border-[var(--border-card)] last:border-b">
                                  <td className="px-4 py-4 text-sm text-[var(--text-primary)] font-medium">
                                    {item.fullName}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-[var(--text-secondary)] space-y-1">
                                    <div>{item.mobile}</div>
                                    <div>{item.email || "-"}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                                    {item.tournamentName}
                                  </td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className="inline-flex rounded-full bg-[var(--secondary-lighter)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)]">
                                      {item.status.replace("_", " ")}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setViewingEnquiry(item)}
                                        className="ui-btn-ghost !min-h-9 !px-2"
                                        title="View Details"
                                      >
                                        <FaEye className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingEnquiry(item)}
                                        className="ui-btn-ghost !min-h-9 !px-2"
                                        title="Edit Enquiry"
                                      >
                                        <FaEdit className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setStatusTarget(item);
                                          setNewStatus(item.status);
                                        }}
                                        className="ui-btn-ghost !min-h-9 !px-2"
                                        title="Update Status"
                                      >
                                        <FaTasks className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteTarget(item)}
                                        className="ui-btn-danger !min-h-9 !px-2"
                                        title="Delete Enquiry"
                                      >
                                        <FaTrash className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {editingEnquiry && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
                          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl">
                            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-card)] bg-[var(--bg-soft)] px-5 py-4 sm:px-7 sm:py-5">
                              <div>
                                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                                  Enquiry management
                                </p>
                                <h3 className="text-2xl font-semibold text-[var(--text-primary)]">Edit enquiry</h3>
                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                  Update the contact, tournament, and service details below.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingEnquiry(null)}
                                className="ui-btn-ghost !min-h-9 shrink-0 !px-3"
                              >
                                Close
                              </button>
                            </div>

                            <div className="enquiry-modal-scroll overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                              <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 sm:p-5">
                                <div className="mb-4">
                                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">Enquiry details</h4>
                                  <p className="text-sm text-[var(--text-secondary)]">Contact and tournament information.</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Full name</span>
                              <input
                                type="text"
                                value={editingEnquiry.fullName || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, fullName: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Mobile</span>
                              <input
                                type="text"
                                value={editingEnquiry.mobile || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, mobile: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Email</span>
                              <input
                                type="email"
                                value={editingEnquiry.email || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, email: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Location</span>
                              <input
                                type="text"
                                value={editingEnquiry.location || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, location: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Tournament name</span>
                              <input
                                type="text"
                                value={editingEnquiry.tournamentName || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, tournamentName: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Number of teams</span>
                              <input
                                type="number"
                                value={editingEnquiry.numberOfTeams || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, numberOfTeams: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Start date</span>
                              <input
                                type="date"
                                value={editingEnquiry.startDate ? editingEnquiry.startDate.split('T')[0] : ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, startDate: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>End date</span>
                              <input
                                type="date"
                                value={editingEnquiry.endDate ? editingEnquiry.endDate.split('T')[0] : ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, endDate: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Preferred contact time</span>
                              <input
                                type="text"
                                value={editingEnquiry.preferredContactTime || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, preferredContactTime: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Budget</span>
                              <input
                                type="text"
                                value={editingEnquiry.budget || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, budget: e.target.value }))}
                                className="ui-input"
                              />
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Status</span>
                              <select
                                value={editingEnquiry.status || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, status: e.target.value }))}
                                className="ui-input"
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-2 text-sm font-medium text-[var(--text-primary)]">
                              <span>Source</span>
                              <select
                                value={editingEnquiry.source || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, source: e.target.value }))}
                                className="ui-input"
                              >
                                {SOURCE_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </label>
                                </div>
                              </div>

                          <div className="mt-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 sm:p-5">
                            <div className="mb-4">
                              <h4 className="text-lg font-semibold text-[var(--text-primary)]">Custom requirement</h4>
                              <p className="text-sm text-[var(--text-secondary)]">
                                Add any special requests, notes, or tournament requirements.
                              </p>
                            </div>
                            <label className="block text-sm font-medium text-[var(--text-primary)]">
                              <textarea
                                value={editingEnquiry.customRequirement || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, customRequirement: e.target.value }))}
                                className="ui-input min-h-[170px] resize-y !py-3 leading-relaxed"
                                placeholder="Describe the client's requirements in detail..."
                              />
                            </label>
                          </div>

                          <div className="mt-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 sm:p-5">
                            <div className="mb-4">
                              <h4 className="text-lg font-semibold text-[var(--text-primary)]">Services</h4>
                              <p className="text-sm text-[var(--text-secondary)]">Select every service requested for this enquiry.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {SERVICE_FIELDS.map((service) => (
                                <label
                                  key={service.key}
                                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                                    editingEnquiry.services?.[service.key]
                                      ? "border-[var(--primary)] bg-[var(--accent-light)] text-[var(--text-primary)] shadow-sm"
                                      : "border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:bg-[var(--accent-light)]"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={editingEnquiry.services?.[service.key] || false}
                                    onChange={() => setEditingEnquiry((prev) => ({
                                      ...prev,
                                      services: {
                                        ...prev.services,
                                        [service.key]: !prev.services?.[service.key]
                                      }
                                    }))}
                                    className="checkbox-consistent"
                                  />
                                  <span>{service.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                            </div>

                          <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border-card)] bg-[var(--bg-soft)] px-5 py-4 sm:px-7">
                            <button
                              type="button"
                              onClick={() => setEditingEnquiry(null)}
                              className="ui-btn-ghost"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleEditSave}
                              className="ui-btn-primary !px-6"
                            >
                              Save changes
                            </button>
                          </div>
                        </div>
                        </div>
                      )}

                      {viewingEnquiry && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
                          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl">
                            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-card)] bg-[var(--bg-soft)] px-5 py-4 sm:px-7 sm:py-5">
                              <div>
                                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                                  Enquiry overview
                                </p>
                                <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
                                  {viewingEnquiry.fullName || "View enquiry"}
                                </h3>
                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                  {viewingEnquiry.tournamentName || "Complete enquiry details"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setViewingEnquiry(null)}
                                className="ui-btn-ghost !min-h-9 shrink-0 !px-3"
                              >
                                Close
                              </button>
                            </div>

                            <div className="enquiry-modal-scroll overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                              <div className="mb-5 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full border border-[var(--primary)] bg-[var(--accent-light)] px-3 py-1.5 text-xs font-bold capitalize text-[var(--primary)]">
                                  {viewingEnquiry.status ? viewingEnquiry.status.replace("_", " ") : "No status"}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-[var(--border-card)] bg-[var(--bg-soft)] px-3 py-1.5 text-xs font-semibold capitalize text-[var(--text-secondary)]">
                                  Source: {viewingEnquiry.source || "-"}
                                </span>
                              </div>

                              <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 sm:p-5">
                                <div className="mb-4">
                                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">Contact details</h4>
                                  <p className="text-sm text-[var(--text-secondary)]">Primary contact information for this enquiry.</p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {[
                                    ["Full name", viewingEnquiry.fullName],
                                    ["Mobile", viewingEnquiry.mobile],
                                    ["Email", viewingEnquiry.email],
                                    ["Location", viewingEnquiry.location],
                                    ["Preferred contact time", viewingEnquiry.preferredContactTime],
                                    ["Budget", viewingEnquiry.budget],
                                  ].map(([label, value]) => (
                                    <div key={label} className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3">
                                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
                                      <p className="mt-1 break-words text-sm font-semibold text-[var(--text-primary)]">{value || "-"}</p>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              <section className="mt-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 sm:p-5">
                                <div className="mb-4">
                                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">Tournament details</h4>
                                  <p className="text-sm text-[var(--text-secondary)]">Schedule and participation overview.</p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                  {[
                                    ["Tournament", viewingEnquiry.tournamentName],
                                    ["Number of teams", viewingEnquiry.numberOfTeams],
                                    ["Start date", viewingEnquiry.startDate ? new Date(viewingEnquiry.startDate).toLocaleDateString() : "-"],
                                    ["End date", viewingEnquiry.endDate ? new Date(viewingEnquiry.endDate).toLocaleDateString() : "-"],
                                  ].map(([label, value]) => (
                                    <div key={label} className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3">
                                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
                                      <p className="mt-1 break-words text-sm font-semibold text-[var(--text-primary)]">{value || "-"}</p>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              <section className="mt-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 sm:p-5">
                                <div className="mb-3">
                                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">Custom requirement</h4>
                                  <p className="text-sm text-[var(--text-secondary)]">Additional notes and special requests.</p>
                                </div>
                                <div className="min-h-[110px] whitespace-pre-wrap rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm leading-7 text-[var(--text-secondary)]">
                                  {viewingEnquiry.customRequirement || "No custom requirements provided."}
                                </div>
                              </section>

                              <section className="mt-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 sm:p-5">
                                <div className="mb-4">
                                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">Requested services</h4>
                                  <p className="text-sm text-[var(--text-secondary)]">Services selected for this enquiry.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {SERVICE_FIELDS.map((service) => (
                                    viewingEnquiry.services?.[service.key] && (
                                      <span
                                        key={service.key}
                                        className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)] bg-[var(--accent-light)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]"
                                      >
                                        <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                                        {service.label}
                                      </span>
                                    )
                                  ))}
                                  {!SERVICE_FIELDS.some(service => viewingEnquiry.services?.[service.key]) && (
                                    <p className="text-sm text-[var(--text-secondary)]">No services selected.</p>
                                  )}
                                </div>
                              </section>
                            </div>

                          <div className="flex justify-end border-t border-[var(--border-card)] bg-[var(--bg-soft)] px-5 py-4 sm:px-7">
                            <button
                              type="button"
                              onClick={() => setViewingEnquiry(null)}
                              className="ui-btn-primary !px-6"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                        </div>
                      )}

                      {statusTarget && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-[var(--bg-card)] rounded-3xl border border-amber-300/40 p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between gap-4 mb-5">
                              <div>
                                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Update status</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Choose the next enquiry state.</p>
                              </div>
                              <button
                                onClick={() => setStatusTarget(null)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              >
                                Cancel
                              </button>
                            </div>
                          <label className="space-y-2 text-sm text-[var(--text-primary)]">
                            Status
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="ui-input"
                            >
                              <option value="">Select status</option>
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="mt-5 flex flex-wrap gap-3">
                            <button onClick={handleStatusUpdate} className="ui-btn-primary">
                              Update status
                            </button>
                            <button
                              onClick={() => setStatusTarget(null)}
                              className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] px-5 py-3 font-semibold text-[var(--text-primary)] hover:bg-[var(--secondary-lighter)] transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                        </div>
                      )}

                      <DeleteConfirmModal
                        open={Boolean(deleteTarget)}
                        title="Delete enquiry"
                        description={`Are you sure you want to delete the enquiry from ${
                          deleteTarget?.fullName || "this contact"
                        }? This action cannot be undone.`}
                        confirmText="Delete enquiry"
                        loading={deletingEnquiry}
                        onConfirm={handleDelete}
                        onClose={() => setDeleteTarget(null)}
                      />
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="rounded-3xl bg-[var(--bg-card)] border border-red-100 p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-[var(--text-primary)]">Management access requires login</p>
                <p className="mt-2 text-[var(--text-secondary)]">Please login to access enquiry management.</p>
                <button
                  onClick={openLogin}
                  className="mt-4 ui-btn-secondary"
                >
                  Login to manage enquiries
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <section className="overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
              <div className="relative overflow-hidden border-b border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-4 sm:px-5">
                <div className="absolute right-6 top-4 hidden h-16 w-16 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] opacity-60 blur-xl sm:block" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">
                      <Sparkles size={13} />
                      Enquiry form
                    </span>
                    <h2 className="mt-3 font-heading text-2xl font-black leading-tight text-[var(--text-primary)] md:text-3xl">
                      Tell us what you want to run.
                    </h2>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-5 text-[var(--text-secondary)]">
                      Share your tournament details and services. Our team will use this to plan the right setup for you.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[390px]">
                    {[
                      { label: "Contact", value: "Details", icon: PhoneCall },
                      { label: "Tournament", value: "Plan", icon: Trophy },
                      { label: "Services", value: selectedServiceCount || 0, icon: ClipboardList },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-[var(--primary)]">
                            <Icon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wide">
                              {item.label}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-bold text-[var(--text-primary)]">
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
                  <div className="order-1 space-y-4 rounded-lg border border-[var(--border-card)] bg-[var(--bg-soft)] p-4 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[var(--border-card)] pb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                        <MessageSquareText size={17} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                          Basic information
                        </h3>
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          Required details help us contact you quickly.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Full name <span className="text-[var(--danger)]">*</span>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => changeForm("fullName", e.target.value)}
                          className="ui-input"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Mobile number <span className="text-[var(--danger)]">*</span>
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={(e) => changeForm("mobile", e.target.value)}
                          className="ui-input"
                          placeholder="Mobile number"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Email address
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => changeForm("email", e.target.value)}
                          className="ui-input"
                          placeholder="Email (optional)"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Location
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => changeForm("location", e.target.value)}
                          className="ui-input"
                          placeholder="City / venue"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3 border-b border-t border-[var(--border-card)] py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
                        <CalendarDays size={17} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                          Tournament plan
                        </h3>
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          Add schedule, scale, and enquiry source.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Tournament name <span className="text-[var(--danger)]">*</span>
                        <input
                          type="text"
                          value={form.tournamentName}
                          onChange={(e) => changeForm("tournamentName", e.target.value)}
                          className="ui-input"
                          placeholder="Tournament name"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Number of teams
                        <input
                          type="number"
                          value={form.numberOfTeams}
                          onChange={(e) => changeForm("numberOfTeams", e.target.value)}
                          className="ui-input"
                          placeholder="Number"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Start date
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => changeForm("startDate", e.target.value)}
                          className="ui-input"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        End date
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => changeForm("endDate", e.target.value)}
                          className="ui-input"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Preferred contact time
                        <input
                          type="text"
                          value={form.preferredContactTime}
                          onChange={(e) => changeForm("preferredContactTime", e.target.value)}
                          className="ui-input"
                          placeholder="E.g. 10am - 2pm"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Source
                        <select
                          className="ui-input"
                          value={form.source}
                          onChange={(e) => changeForm("source", e.target.value)}
                        >
                          {SOURCE_OPTIONS.map((source) => (
                            <option key={source} value={source}>
                              {source.charAt(0).toUpperCase() + source.slice(1)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
                      <label className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                        <span className="mb-2 flex items-center justify-between gap-3">
                          <span>Custom requirement</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                            Optional
                          </span>
                        </span>
                        <textarea
                          value={form.customRequirement}
                          onChange={(e) => changeForm("customRequirement", e.target.value)}
                          className="min-h-[92px] w-full resize-none rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--border-primary)] focus:bg-[var(--bg-card)]"
                          placeholder="Example: auction setup, live scoring, streaming, ground support..."
                        />
                      </label>
                      <label className="space-y-2 text-sm font-semibold text-[var(--text-primary)]">
                        Budget
                        <input
                          type="text"
                          value={form.budget}
                          onChange={(e) => changeForm("budget", e.target.value)}
                          className="ui-input"
                          placeholder="Budget range"
                        />
                        <div className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-2.5 text-xs font-medium leading-5 text-[var(--text-secondary)]">
                          Optional, but useful for suggesting the right service package.
                        </div>
                      </label>
                    </div>

                  </div>

                  <aside className="order-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] xl:sticky xl:top-24 xl:self-start">
                    <div className="mb-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-[var(--text-primary)]">
                            Services you can request
                          </h3>
                          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                            Select all services you need for your tournament.
                          </p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] text-sm font-black text-[var(--primary)]">
                          {selectedServiceCount}
                        </span>
                      </div>
                    </div>

                    <div className="grid max-h-[520px] gap-2 overflow-y-auto pr-1 [scrollbar-color:var(--border-primary)_transparent] [scrollbar-width:thin]">
                      {SERVICE_FIELDS.map((service) => (
                        <label
                          key={service.key}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                            form.services[service.key]
                              ? "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)] shadow-sm"
                              : "border-[var(--border-card)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--bg-soft)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.services[service.key]}
                            onChange={() => toggleService(service.key)}
                            className="checkbox-consistent"
                          />
                          <span>{service.label}</span>
                          {form.services[service.key] && (
                            <CheckCircle2 size={16} className="ml-auto shrink-0" />
                          )}
                        </label>
                      ))}
                    </div>
                  </aside>

                  <div className="order-3 grid gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--bg-main)] p-3 sm:grid-cols-2 xl:col-span-2">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="ui-btn-primary w-full"
                    >
                      {submitting ? "Submitting..." : "Submit Enquiry"}
                    </button>
                    <button
                      onClick={resetForm}
                      type="button"
                      className="w-full rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-5 py-3 font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                    >
                      Reset form
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Enquiries;
