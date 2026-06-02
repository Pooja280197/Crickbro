import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
  Twitter,
  LogOut,
} from "lucide-react";
import { BsTelephoneFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isValidMongoObjectId } from "../../../redux/actions";

const Header = ({ data }) => {
  const headerData = data;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isPreviewMode = location.pathname === "/preview-Page";
  const dispatch = useDispatch();
  const tournamentLogo =
    headerData?.tournamentId?.logo || headerData?.logo || headerData?.image;
  const tournamentName =
    headerData?.tournamentId?.name || "Tournament";

  const readSession = () => {
    const token = localStorage.getItem("token");
    const pid = localStorage.getItem("playerId");
    if (!token || token === "null" || token === "undefined") return false;
    return isValidMongoObjectId(pid);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(readSession);

  useEffect(() => {
    const sync = () => setIsLoggedIn(readSession());
    window.addEventListener("userLoggedIn", sync);
    window.addEventListener("crickbro-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("userLoggedIn", sync);
      window.removeEventListener("crickbro-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const platformIcons = {
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    instagram: Instagram,
    twitter: Twitter,
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.clear();
    // Remove sensitive query params like playerId/playertoken from URL.
    const cleanPath = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanPath);
    window.location.reload(); // refresh page after logout
  };

  const getAbbreviatedName = (name, maxLength = 12) => {
    const trimmedName = String(name).trim();
    if (trimmedName.length <= maxLength) return trimmedName;
    return trimmedName.substring(0, maxLength) + "..";
  };

  return (
    <header
      className={`sticky z-50 w-full ${isPreviewMode ? "top-16" : "top-0"
        } ${isScrolled ? "bg-white/60" : "bg-white/90"} backdrop-blur-md shadow-sm transition-all duration-300`}
    >
      {/* Top Bar (desktop only) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-1 justify-between items-center text-xs font-light text-gray-700">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 transition hover:opacity-80"
          >
            {tournamentLogo ? (
              <img
                src={tournamentLogo}
                alt={tournamentName}
                className="h-10 w-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-sm font-bold text-white">
                {String(tournamentName).trim().charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <span className="font-bold text-lg text-gray-800 max-w-[280px] truncate hidden lg:block">
              {tournamentName}
            </span>
            <span
              className="font-bold text-lg text-gray-800 max-w-[180px] truncate block lg:hidden"
              title={tournamentName}
            >
              {getAbbreviatedName(tournamentName, 18)}
            </span>
          </Link>
        </div>

        {/* Center: Contact Info */}
        <div className="flex items-center gap-4 text-gray-500">
          {headerData?.contactInfo?.mobileNumber && (
            <a
              href={`tel:${headerData.contactInfo.mobileNumber}`}
              className="flex items-center gap-1 hover:text-gray-900 text-gray-500 transition"
            >
              <Phone size={14} />
              {headerData.contactInfo.mobileNumber}
            </a>
          )}
          {headerData?.contactInfo?.phoneNumber && (
            <a
              href={`tel:${headerData.contactInfo.phoneNumber}`}
              className="flex items-center gap-1 hover:text-gray-900 text-gray-500 transition"
            >
              <BsTelephoneFill size={14} />
              {headerData.contactInfo.phoneNumber}
            </a>
          )}
          {headerData?.contactInfo?.email && (
            <a
              href={`mailto:${headerData.contactInfo.email}`}
              className="flex items-center gap-1 hover:text-gray-900 text-gray-500 transition"
            >
              <Mail size={14} />
              {headerData.contactInfo.email}
            </a>
          )}
        </div>

        {/* Right: Social Icons */}
        <div className="flex items-center gap-1">
          <span className="font-light text-gray-500">Follow Us:</span>
          <div className="flex gap-1">
            {headerData?.socialAccounts
              ?.sort((a, b) => a.order - b.order)
              .map((social) => {
                const Icon = platformIcons[social.platform?.toLowerCase()];
                if (!Icon) return null;
                return (
                  <a
                    key={social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                    title={social.platform}
                  >
                    <Icon size={16} className="text-gray-700" />
                  </a>
                );
              })}
          </div>
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="ml-4 flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900 transition"
            >
              <LogOut size={16} aria-hidden />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex md:hidden justify-between items-center max-w-7xl mx-auto px-4 py-2 gap-2">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 min-w-0 transition hover:opacity-80"
        >
          {tournamentLogo ? (
            <img
              src={tournamentLogo}
              alt={tournamentName}
              className="h-9 w-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-xs font-bold text-white flex-shrink-0">
              {String(tournamentName).trim().charAt(0).toUpperCase() || "A"}
            </div>
          )}
          <span
            className="font-bold text-base text-gray-800 truncate max-w-[140px]"
            title={tournamentName}
          >
            {getAbbreviatedName(tournamentName, 10)}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100"
              aria-label="Logout"
            >
              <LogOut size={18} className="inline" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-2xl font-bold"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="flex flex-col px-4 py-2 gap-2">
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-gray-900 transition text-left font-medium flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}

            {headerData?.contactInfo?.mobileNumber && (
              <a
                href={`tel:${headerData.contactInfo.mobileNumber}`}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition"
              >
                <Phone size={16} />
                {headerData.contactInfo.mobileNumber}
              </a>
            )}
            {headerData?.contactInfo?.email && (
              <a
                href={`mailto:${headerData.contactInfo.email}`}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition"
              >
                <Mail size={16} />
                {headerData.contactInfo.email}
              </a>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-light text-gray-500">Follow Us:</span>
              {headerData?.socialAccounts?.map((social) => {
                const Icon = platformIcons[social.platform?.toLowerCase()];
                if (!Icon) return null;
                return (
                  <a
                    key={social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                    title={social.platform}
                  >
                    <Icon size={18} className="text-gray-700" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
