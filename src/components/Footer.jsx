import React from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import DarkThemeLogo from "../assets/Images/Logo.png";
import LightThemeLogo from "../assets/crickbro-auction-logo/LightThemeLogo.png";
import { contactEmail } from "../config/env";

const Footer = ({ theme ,isDarkTheme = false }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { label: "Home", link: "/" },
      { label: "Auction", link: "/auction" },
      { label: "About Us", link: "/about" },
      { label: "Enquiries", link: "/enquiries" },
      { label: "Privacy Policy", link: "/privacy-policy" },
      { label: "Terms of Service", link: "/terms-of-service" },
    ],
  };

  const socials = [
    {
      icon: FaYoutube,
      label: "YouTube",
      url: "https://www.youtube.com/@crickbroOfficials",
    },
    {
      icon: FaInstagram,
      label: "Instagram",
      url: "https://instagram.com/crickbro.official?igsh=OXdvbHN0MmM2Nnhk",
    },
    {
      icon: FaFacebookF,
      label: "Facebook",
      url: "https://www.facebook.com/crickbro.official",
    },
    {
      icon: FaLinkedinIn,
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/crickbro/",
    },
    {
      icon: Globe,
      label: "Website",
      url: "https://crickbro.com/",
    },
  ];

  const footerClasses = isDarkTheme 
    ? "border-t border-gray-700 bg-gray-900 text-gray-100" 
    : "border-t border-[var(--border-card)] bg-[var(--bg-deep)] text-[var(--text-primary)]";

  return (
    <footer className={footerClasses}>
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-9">
        {/* ================= MAIN FOOTER ================= */}
        <div className="mb-7 grid grid-cols-2 items-start gap-6 md:mb-8 md:grid-cols-3 md:gap-8">
          {/* ================= BRAND ================= */}
          <div className="col-span-2 w-full md:col-span-1 md:min-w-[260px]">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-card)]  md:h-24 md:w-24`}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={theme == "dark" ? DarkThemeLogo : LightThemeLogo}
                  alt="CrickBro Logo"
                  className="h-12 w-12 object-contain md:h-24 md:w-24"
                />
              </div>
              <div className="min-w-0">
                <h2 className={`font-heading text-lg font-bold tracking-tight ${isDarkTheme ? "text-gray-100" : "text-[var(--text-primary)]"} md:text-xl`}>
                  CrickBro
                </h2>
                <p className={`font-main text-xs ${isDarkTheme ? "text-gray-400" : "text-[var(--text-secondary)]"}`}>
                  Professional Auction Platform
                </p>
              </div>
            </div>

            <p className={`mb-4 max-w-md font-main text-sm leading-relaxed ${isDarkTheme ? "text-gray-400" : "text-[var(--text-secondary)]"}`}>
              Revolutionizing cricket auctions with intelligent technology.
              Trusted by leagues, teams, and players across India for
              professional auction management.
            </p>

            {/* DOWNLOAD BUTTONS */}
            <div className="flex flex-wrap items-center gap-1">
              <a
                href="https://play.google.com/store/apps/details?id=com.crickbroapp&hl=en_IN"
                target="_blank"
                rel="noreferrer"
                className="flex h-16 w-[144px] min-w-0 items-center justify-center overflow-hidden rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                aria-label="Get CrickBro on Google Play"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-full w-full object-fill"
                />
              </a>

              <a
                href="https://apps.apple.com/in/app/crickbro-cricket-scoring-app/id6740860359"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-[144px] min-w-0 items-center justify-center overflow-hidden rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                aria-label="Download CrickBro on the App Store"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-full w-full object-fill"
                />
              </a>
            </div>
          </div>

          {/* ================= EXPLORE ================= */}
          <div className="flex w-full flex-col items-start md:items-center">
            <h3 className={`mb-3 font-oswald text-lg ${isDarkTheme ? "text-gray-100" : "text-[var(--text-primary)]"} md:text-xl`}>
              Explore
            </h3>
            <ul className="w-full space-y-1 text-left md:text-center">
              {footerLinks.Explore.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.link}
                    className={`block py-1 text-sm font-medium transition-colors ${isDarkTheme ? "text-gray-400 hover:text-yellow-500" : "text-[var(--text-secondary)] hover:text-[var(--primary)]"}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= CONTACT ================= */}
          <div className="flex w-full flex-col gap-4 items-start">
            {/* Email */}
            <div className="flex items-center gap-3 w-full">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${isDarkTheme ? "border-gray-700 bg-gray-800 text-yellow-500" : "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"}`}>
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-[var(--text-secondary)]"}`}>
                  Email
                </div>
                <div className={`break-all font-main text-sm font-semibold ${isDarkTheme ? "text-gray-100" : "text-[var(--text-primary)]"}`}>
                  {contactEmail}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 w-full">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${isDarkTheme ? "border-gray-700 bg-gray-800 text-yellow-500" : "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"}`}>
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-[var(--text-secondary)]"}`}>
                  Phone
                </div>
                <div className={`font-main text-sm font-semibold ${isDarkTheme ? "text-gray-100" : "text-[var(--text-primary)]"}`}>
                  +91 7000742081
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 w-full">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${isDarkTheme ? "border-gray-700 bg-gray-800 text-yellow-500" : "border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]"}`}>
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-[var(--text-secondary)]"}`}>
                  Office
                </div>
                <div className={`font-main text-sm font-semibold ${isDarkTheme ? "text-gray-100" : "text-[var(--text-primary)]"}`}>
                  Indore, India
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Socials */}
        <div className={`flex flex-col gap-3 border-t py-4 text-center md:flex-row md:items-center md:justify-between md:text-left ${isDarkTheme ? "border-gray-700" : "border-[var(--border-card)]"}`}>
          <div className={`font-semibold ${isDarkTheme ? "text-gray-100" : "text-[var(--text-primary)]"}`}>
            Follow us on social media
          </div>
          <div className="flex items-center justify-center gap-4 md:justify-start">
            {socials.map((social) => {
              const SocialIcon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${isDarkTheme ? "border-gray-700 bg-gray-800 text-gray-400 hover:border-yellow-500 hover:bg-gray-700 hover:text-yellow-500" : "border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"}`}
                >
                  <SocialIcon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className={`border-t pt-4 text-center font-main text-xs font-medium md:pt-5 ${isDarkTheme ? "border-gray-700 text-gray-400" : "border-[var(--border-card)] text-[var(--text-secondary)]"}`}>
          © {currentYear} CrickBro. All rights reserved. | Made for cricket
          lovers in India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
