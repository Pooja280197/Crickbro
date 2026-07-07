import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Share2,
} from "lucide-react";
import { BsTelephoneFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isValidMongoObjectId } from "../../../redux/actions";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import { useLoginPopup } from "../../../context/LoginPopupContext";

const Header = ({ data }) => {
  const headerData = data;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const isPreviewMode = location.pathname === "/preview-Page";
  const dispatch = useDispatch();
  const { openLoginPopup } = useLoginPopup();
  const tournamentLogo =
    headerData?.tournamentId?.logo || headerData?.logo || headerData?.image;
  const tournamentName =
    headerData?.tournamentId?.name || "Tournament";
  
  // Dark theme colors (fixed)
  const headerBackground = isScrolled
    ? "rgba(15, 23, 42, 0.96)"
    : "rgba(15, 23, 42, 0.92)";

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMoreDropdown && !event.target.closest('.more-dropdown')) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMoreDropdown]);

  const platformIcons = {
    facebook: FaFacebook,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    instagram: FaInstagram,
    twitter: FaTwitter,
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.clear();
    const cleanPath = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanPath);
    window.location.reload();
  };

  const handleLogin = () => {
    openLoginPopup(() => {
      window.dispatchEvent(new Event("crickbro-auth-change"));
    });
    setMobileMenuOpen(false);
  };

  const getAbbreviatedName = (name, maxLength = 12) => {
    const trimmedName = String(name).trim();
    if (trimmedName.length <= maxLength) return trimmedName;
    return trimmedName.substring(0, maxLength) + "..";
  };

  // Collect all contact info
  const contactItems = [
    headerData?.contactInfo?.mobileNumber && {
      type: 'mobile',
      icon: Phone,
      value: headerData.contactInfo.mobileNumber,
      href: `tel:${headerData.contactInfo.mobileNumber}`,
      label: 'Mobile Number'
    },
    headerData?.contactInfo?.phoneNumber && {
      type: 'phone',
      icon: BsTelephoneFill,
      value: headerData.contactInfo.phoneNumber,
      href: `tel:${headerData.contactInfo.phoneNumber}`,
      label: 'Phone Number'
    },
    headerData?.contactInfo?.email && {
      type: 'email',
      icon: Mail,
      value: headerData.contactInfo.email,
      href: `mailto:${headerData.contactInfo.email}`,
      label: 'Email Address'
    }
  ].filter(Boolean);

  // Social items
  const socialItems = headerData?.socialAccounts
    ?.sort((a, b) => a.order - b.order)
    .map((social) => {
      const Icon = platformIcons[social.platform?.toLowerCase()];
      if (!Icon) return null;
      return {
        platform: social.platform,
        icon: Icon,
        url: social.url,
        label: social.platform
      };
    })
    .filter(Boolean) || [];

  // Only show first 1 contact and first 2 social items in header
  const visibleContactItems = contactItems.slice(0, 1);
  const visibleSocialItems = socialItems.slice(0, 2);
  
  // Rest go to more dropdown
  const hiddenContactItems = contactItems.slice(1);
  const hiddenSocialItems = socialItems.slice(2);
  
  const hasMoreItems = hiddenContactItems.length > 0 || hiddenSocialItems.length > 0;

  return (
    <header
      className={`sticky z-50 w-full ${isPreviewMode ? "top-16" : "top-0"} border-b backdrop-blur-xl transition-all duration-300`}
      style={{
        background: headerBackground,
        borderColor: "rgba(255, 255, 255, 0.14)",
        boxShadow: isScrolled
          ? "0 14px 34px rgba(15, 23, 42, 0.28)"
          : "0 2px 0 rgba(255, 255, 255, 0.08)",
        color: "#f8fafc",
      }}
    >
      {/* Top Bar (desktop only) */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-6 py-2.5 items-center justify-between gap-6 text-xs font-medium">
        {/* Left: Logo */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 transition hover:opacity-90"
          >
            {tournamentLogo ? (
              <img
                src={tournamentLogo}
                alt={tournamentName}
                className="h-12 w-12 rounded-2xl object-cover border border-white/60 shadow-sm"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm"
                style={{ background: "#1e293b" }}
              >
                {String(tournamentName).trim().charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <span className="text-lg font-bold tracking-tight max-w-[500px]" style={{ color: "#f8fafc" }}>
              {tournamentName}
            </span>
          </Link>
        </div>

        {/* Center: Contact & Social Info - Organized */}
        <div className="flex items-center gap-3">
          {/* Visible Contact Items */}
          {visibleContactItems.map((contact, index) => (
            <a
              key={`contact-${index}`}
              href={contact.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10 group"
              style={{ color: "#cbd5e1" }}
            >
              <contact.icon size={15} className="group-hover:text-[#3b82f6] transition-colors" />
              <span className="text-sm font-medium truncate max-w-[180px]">
                {contact.value}
              </span>
            </a>
          ))}
          
          {/* Separator between contacts and social */}
          {visibleContactItems.length > 0 && visibleSocialItems.length > 0 && (
            <div className="w-px h-5 bg-white/12"></div>
          )}
          
          {/* Visible Social Items */}
          {visibleSocialItems.map((social, index) => (
            <a
              key={`social-${index}`}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10 group"
              style={{ color: "#cbd5e1" }}
            >
              <social.icon size={15} className="group-hover:text-[#3b82f6] transition-colors" />
              <span className="text-sm font-medium capitalize">
                {social.platform}
              </span>
            </a>
          ))}
          
          {/* More Dropdown Button */}
          {hasMoreItems && (
            <div className="relative more-dropdown">
              <button
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all hover:bg-white/10"
                style={{ color: "#cbd5e1" }}
              >
                <span className="text-sm font-medium">More</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showMoreDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showMoreDropdown && (
                <div 
                  className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    background: "rgba(30, 41, 59, 0.96)",
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(12px)"
                  }}
                >
                  {/* Contact Section in Dropdown */}
                  {hiddenContactItems.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "#cbd5e1" }}>
                        Contact Information
                      </div>
                      {hiddenContactItems.map((contact, index) => (
                        <a
                          key={`dropdown-contact-${index}`}
                          href={contact.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors group"
                          onClick={() => setShowMoreDropdown(false)}
                        >
                          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-[#3b82f6] transition-colors">
                            <contact.icon size={16} className="group-hover:text-white transition-colors" style={{ color: "#3b82f6" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium" style={{ color: "#cbd5e1" }}>
                              {contact.label}
                            </div>
                            <div className="text-sm font-medium truncate" style={{ color: "#f8fafc" }}>
                              {contact.value}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {/* Separator */}
                  {hiddenContactItems.length > 0 && hiddenSocialItems.length > 0 && (
                    <div className="h-px bg-white/12 my-1"></div>
                  )}
                  
                  {/* Social Section in Dropdown */}
                  {hiddenSocialItems.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "#cbd5e1" }}>
                        Social Media
                      </div>
                      {hiddenSocialItems.map((social, index) => (
                        <a
                          key={`dropdown-social-${index}`}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors group"
                          onClick={() => setShowMoreDropdown(false)}
                        >
                          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-[#3b82f6] transition-colors">
                            <social.icon size={16} className="group-hover:text-white transition-colors" style={{ color: "#3b82f6" }} />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium capitalize" style={{ color: "#f8fafc" }}>
                              {social.platform}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions - Login/Logout only */}
        <div className="flex shrink-0 items-center gap-3">
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-white/10"
              style={{ color: "#f8fafc" }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

          ) }
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex lg:hidden justify-between items-center px-4 py-3 gap-2">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2">
          {tournamentLogo ? (
            <img src={tournamentLogo} alt={tournamentName} className="h-10 w-10 rounded-xl object-cover shadow-sm flex-shrink-0" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm flex-shrink-0"
              style={{ background: "#1e293b" }}>
              {String(tournamentName).trim().charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-bold truncate max-w-[180px]" style={{ color: "#f8fafc" }}>
            {tournamentName}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10"
              style={{ color: "#f8fafc" }}>
              <LogOut size={18} />
            </button>
          ) : (
            <button onClick={handleLogin} className="p-2 rounded-lg text-white shadow-sm hover:opacity-90"
              style={{ background: "#3b82f6" }}>
              <LogIn size={17} />
            </button>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border transition hover:bg-white/10"
            style={{ borderColor: "rgba(255, 255, 255, 0.12)", color: "#f8fafc", background: "rgba(30, 41, 59, 0.86)" }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - All items organized */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t shadow-lg max-h-[80vh] overflow-y-auto"
          style={{ background: headerBackground, borderColor: "rgba(255, 255, 255, 0.12)" }}>
          <div className="flex flex-col p-4 gap-4">
            {/* Contact Section */}
            {contactItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider px-2 flex items-center gap-2" style={{ color: "#cbd5e1" }}>
                  <Phone size={12} />
                  Contact Information
                </h3>
                <div className="space-y-1">
                  {contactItems.map((contact, idx) => (
                    <a key={idx} href={contact.href}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/10 group">
                      <div className="p-2 rounded-lg bg-white/10 group-hover:bg-[#3b82f6] transition-colors">
                        <contact.icon size={16} className="group-hover:text-white" style={{ color: "#3b82f6" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium" style={{ color: "#cbd5e1" }}>{contact.label}</div>
                        <div className="text-sm font-medium break-all" style={{ color: "#f8fafc" }}>{contact.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Social Section */}
            {socialItems.length > 0 && (
              <>
                {contactItems.length > 0 && <div className="h-px bg-white/12"></div>}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider px-2 flex items-center gap-2" style={{ color: "#cbd5e1" }}>
                    <Share2 size={12} />
                    Follow Us
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {socialItems.map((social, idx) => (
                      <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/10 group">
                        <div className="p-2 rounded-lg bg-white/10 group-hover:bg-[#3b82f6] transition-colors">
                          <social.icon size={16} className="group-hover:text-white" style={{ color: "#3b82f6" }} />
                        </div>
                        <span className="text-sm font-medium capitalize" style={{ color: "#f8fafc" }}>
                          {social.platform}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Auth Section for Mobile */}
            {isLoggedIn && (
              <>
                <div className="h-px bg-white/12"></div>
                <button onClick={handleLogout}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all hover:bg-white/10"
                  style={{ color: "#f8fafc" }}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;