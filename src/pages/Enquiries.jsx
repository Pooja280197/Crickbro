import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../utils/api";
import { FaEdit, FaTasks, FaTrash, FaPlus, FaSearch, FaEye } from "react-icons/fa";

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
  const activeTab = isManage ? "manage" : "new";

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

  const handleDelete = async (enquiryId) => {
    const confirmed = window.confirm("Delete this enquiry permanently?");
    if (!confirmed) return;
    try {
      await api.delete(`/webSiteApi/enquiries/delete/${enquiryId}`);
      toast.success("Enquiry deleted successfully.");
      fetchEnquiries();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed.");
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main className="max-w-7xl mx-auto px-4 py-10">
        {isManage ? (
          <>
            {isLoggedIn ? (
              <>
                <section className="rounded-[2rem] bg-white shadow-xl border border-slate-200 overflow-hidden mb-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-100 px-6 py-5">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Enquiry management</p>
                      <h2 className="text-2xl font-semibold text-slate-900">Manage enquiries</h2>
                    </div>
                    <button
                      onClick={() => navigate('/enquiries')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Create New Enquiry
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-4">
                        <label className="space-y-2 text-sm text-slate-700">
                          Search
                          <input
                            type="search"
                            value={manage.search}
                            onChange={(e) => setManage((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                            className="input-field"
                            placeholder="Name, email, mobile or tournament"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-slate-700">
                          Status
                          <select
                            className="input-field"
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
                        <label className="space-y-2 text-sm text-slate-700">
                          From date
                          <input
                            type="date"
                            value={manage.startDate}
                            onChange={(e) => setManage((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
                            className="input-field"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-slate-700">
                          To date
                          <input
                            type="date"
                            value={manage.endDate}
                            onChange={(e) => setManage((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))}
                            className="input-field"
                          />
                        </label>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Showing enquiries</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {manage.total} results • page {manage.page}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 items-center">
                            <button
                              type="button"
                              onClick={() => setManage((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                              disabled={manage.page === 1 || loadingList}
                              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:cursor-not-allowed disabled:opacity-50"
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
                              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Next
                            </button>
                            <label className="text-sm text-slate-700">
                              Page size
                              <select
                                value={manage.limit}
                                onChange={(e) => setManage((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                                className="ml-2 rounded-xl border border-slate-300 bg-white px-3 py-2"
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

                      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full text-left">
                          <thead className="bg-slate-100 text-slate-500 text-sm uppercase tracking-[0.15em]">
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
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                  Loading enquiries...
                                </td>
                              </tr>
                            ) : manage.items.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                  No enquiries found. Adjust filters or refresh.
                                </td>
                              </tr>
                            ) : (
                              manage.items.map((item) => (
                                <tr key={item._id} className="border-t border-slate-200 last:border-b">
                                  <td className="px-4 py-4 text-sm text-slate-800 font-medium">
                                    {item.fullName}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-slate-600 space-y-1">
                                    <div>{item.mobile}</div>
                                    <div>{item.email || "-"}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-slate-600">
                                    {item.tournamentName}
                                  </td>
                                  <td className="px-4 py-4 text-sm">
                                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                                      {item.status.replace("_", " ")}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-slate-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-slate-700">
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setViewingEnquiry(item)}
                                        className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition"
                                        title="View Details"
                                      >
                                        <FaEye className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingEnquiry(item)}
                                        className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition"
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
                                        className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition"
                                        title="Update Status"
                                      >
                                        <FaTasks className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition"
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
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-3xl border border-indigo-300/30 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between gap-4 mb-5">
                              <div>
                                <h3 className="text-xl font-semibold text-slate-900">Edit enquiry</h3>
                                <p className="text-sm text-slate-600">Update all enquiry details and save changes.</p>
                              </div>
                              <button
                                onClick={() => setEditingEnquiry(null)}
                                className="text-slate-500 hover:text-slate-900"
                              >
                                Cancel
                              </button>
                            </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm text-slate-700">
                              Full name
                              <input
                                type="text"
                                value={editingEnquiry.fullName || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, fullName: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Mobile
                              <input
                                type="text"
                                value={editingEnquiry.mobile || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, mobile: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Email
                              <input
                                type="email"
                                value={editingEnquiry.email || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, email: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Location
                              <input
                                type="text"
                                value={editingEnquiry.location || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, location: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Tournament name
                              <input
                                type="text"
                                value={editingEnquiry.tournamentName || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, tournamentName: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Number of teams
                              <input
                                type="number"
                                value={editingEnquiry.numberOfTeams || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, numberOfTeams: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Start date
                              <input
                                type="date"
                                value={editingEnquiry.startDate ? editingEnquiry.startDate.split('T')[0] : ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, startDate: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              End date
                              <input
                                type="date"
                                value={editingEnquiry.endDate ? editingEnquiry.endDate.split('T')[0] : ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, endDate: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Preferred contact time
                              <input
                                type="text"
                                value={editingEnquiry.preferredContactTime || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, preferredContactTime: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Budget
                              <input
                                type="text"
                                value={editingEnquiry.budget || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, budget: e.target.value }))}
                                className="input-field"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Status
                              <select
                                value={editingEnquiry.status || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, status: e.target.value }))}
                                className="input-field"
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                              Source
                              <select
                                value={editingEnquiry.source || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, source: e.target.value }))}
                                className="input-field"
                              >
                                {SOURCE_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <div className="mt-4">
                            <label className="space-y-2 text-sm text-slate-700">
                              Custom requirement
                              <textarea
                                value={editingEnquiry.customRequirement || ""}
                                onChange={(e) => setEditingEnquiry((prev) => ({ ...prev, customRequirement: e.target.value }))}
                                className="input-field min-h-[100px]"
                                placeholder="Describe requirements"
                              />
                            </label>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-lg font-semibold text-slate-900 mb-3">Services</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {SERVICE_FIELDS.map((service) => (
                                <label
                                  key={service.key}
                                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                                    editingEnquiry.services?.[service.key]
                                      ? "border-indigo-600 bg-indigo-50 text-slate-900 shadow-sm"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:bg-slate-50"
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
                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              onClick={handleEditSave}
                              className="btn-primary"
                            >
                              Save changes
                            </button>
                            <button
                              onClick={() => setEditingEnquiry(null)}
                              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 transition"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                        </div>
                      )}

                      {viewingEnquiry && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-3xl border border-green-300/30 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between gap-4 mb-5">
                              <div>
                                <h3 className="text-xl font-semibold text-slate-900">View enquiry</h3>
                                <p className="text-sm text-slate-600">View all enquiry details.</p>
                              </div>
                              <button
                                onClick={() => setViewingEnquiry(null)}
                                className="text-slate-500 hover:text-slate-900"
                              >
                                Close
                              </button>
                            </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Full name:</strong> {viewingEnquiry.fullName || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Mobile:</strong> {viewingEnquiry.mobile || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Email:</strong> {viewingEnquiry.email || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Location:</strong> {viewingEnquiry.location || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Tournament name:</strong> {viewingEnquiry.tournamentName || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Number of teams:</strong> {viewingEnquiry.numberOfTeams || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Start date:</strong> {viewingEnquiry.startDate ? new Date(viewingEnquiry.startDate).toLocaleDateString() : "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>End date:</strong> {viewingEnquiry.endDate ? new Date(viewingEnquiry.endDate).toLocaleDateString() : "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Preferred contact time:</strong> {viewingEnquiry.preferredContactTime || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Budget:</strong> {viewingEnquiry.budget || "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Status:</strong> {viewingEnquiry.status ? viewingEnquiry.status.replace("_", " ") : "-"}
                            </div>
                            <div className="space-y-2 text-sm text-slate-700">
                              <strong>Source:</strong> {viewingEnquiry.source ? viewingEnquiry.source.charAt(0).toUpperCase() + viewingEnquiry.source.slice(1) : "-"}
                            </div>
                          </div>
                          <div className="mt-4">
                            <strong className="text-sm text-slate-700">Custom requirement:</strong>
                            <p className="mt-1 text-sm text-slate-600">{viewingEnquiry.customRequirement || "-"}</p>
                          </div>
                          <div className="mt-4">
                            <strong className="text-sm text-slate-700">Services:</strong>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {SERVICE_FIELDS.map((service) => (
                                viewingEnquiry.services?.[service.key] && (
                                  <div key={service.key} className="text-sm text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-200">
                                    {service.label}
                                  </div>
                                )
                              ))}
                              {!SERVICE_FIELDS.some(service => viewingEnquiry.services?.[service.key]) && (
                                <div className="text-sm text-slate-500">No services selected</div>
                              )}
                            </div>
                          </div>
                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              onClick={() => setViewingEnquiry(null)}
                              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 transition"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                        </div>
                      )}

                      {statusTarget && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-3xl border border-amber-300/40 p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between gap-4 mb-5">
                              <div>
                                <h3 className="text-xl font-semibold text-slate-900">Update status</h3>
                                <p className="text-sm text-slate-600">Choose the next enquiry state.</p>
                              </div>
                              <button
                                onClick={() => setStatusTarget(null)}
                                className="text-slate-500 hover:text-slate-900"
                              >
                                Cancel
                              </button>
                            </div>
                          <label className="space-y-2 text-sm text-slate-700">
                            Status
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="input-field"
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
                            <button onClick={handleStatusUpdate} className="btn-primary">
                              Update status
                            </button>
                            <button
                              onClick={() => setStatusTarget(null)}
                              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="rounded-3xl bg-white border border-red-100 p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-900">Management access requires login</p>
                <p className="mt-2 text-slate-600">Please login to access enquiry management.</p>
                <button
                  onClick={openLogin}
                  className="mt-4 btn-primary"
                >
                  Login to manage enquiries
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <section className="rounded-[2rem] bg-white shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-100 px-6 py-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">Enquiry form</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Submit your enquiry</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
                  <div className="space-y-6 bg-slate-50 rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        Full name
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => changeForm("fullName", e.target.value)}
                          className="input-field"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Mobile number
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={(e) => changeForm("mobile", e.target.value)}
                          className="input-field"
                          placeholder="Mobile number"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Email address
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => changeForm("email", e.target.value)}
                          className="input-field"
                          placeholder="Email (optional)"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Location
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => changeForm("location", e.target.value)}
                          className="input-field"
                          placeholder="City / venue"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Tournament name
                        <input
                          type="text"
                          value={form.tournamentName}
                          onChange={(e) => changeForm("tournamentName", e.target.value)}
                          className="input-field"
                          placeholder="Tournament name"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Number of teams
                        <input
                          type="number"
                          value={form.numberOfTeams}
                          onChange={(e) => changeForm("numberOfTeams", e.target.value)}
                          className="input-field"
                          placeholder="Number"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Start date
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => changeForm("startDate", e.target.value)}
                          className="input-field"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        End date
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => changeForm("endDate", e.target.value)}
                          className="input-field"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Preferred contact time
                        <input
                          type="text"
                          value={form.preferredContactTime}
                          onChange={(e) => changeForm("preferredContactTime", e.target.value)}
                          className="input-field"
                          placeholder="E.g. 10am - 2pm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        Source
                        <select
                          className="input-field"
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

                    <div>
                      <label className="space-y-2 text-sm text-slate-700">
                        Custom requirement
                        <textarea
                          value={form.customRequirement}
                          onChange={(e) => changeForm("customRequirement", e.target.value)}
                          className="input-field min-h-[140px]"
                          placeholder="Describe your exact requirement"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="space-y-2 text-sm text-slate-700">
                        Budget
                        <input
                          type="text"
                          value={form.budget}
                          onChange={(e) => changeForm("budget", e.target.value)}
                          className="input-field"
                          placeholder="Budget range"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary w-full"
                      >
                        {submitting ? "Submitting..." : "Submit Enquiry"}
                      </button>
                      <button
                        onClick={resetForm}
                        type="button"
                        className="w-full rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Reset form
                      </button>
                    </div>
                  </div>

                  <aside className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Services you can request
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                      Select all services you need for your tournament.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {SERVICE_FIELDS.map((service) => (
                        <label
                          key={service.key}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                            form.services[service.key]
                              ? "border-indigo-600 bg-indigo-50 text-slate-900 shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.services[service.key]}
                            onChange={() => toggleService(service.key)}
                            className="checkbox-consistent"
                          />
                          <span>{service.label}</span>
                        </label>
                      ))}
                    </div>
                  </aside>
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
