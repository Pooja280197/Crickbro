import React from "react";
import { Apple, Download, Globe, Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import logo from "../assets/Images/Logo.png";
import { contactEmail } from "../config/env";

const Footer = () => {
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

  return (
    <footer className="border-t border-[var(--border-card)] bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-9">
        {/* ================= MAIN FOOTER ================= */}
        <div className="mb-7 grid grid-cols-2 items-start gap-6 md:mb-8 md:grid-cols-3 md:gap-8">
          {/* ================= BRAND ================= */}
          <div className="col-span-2 w-full md:col-span-1 md:min-w-[260px]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] md:h-24 md:w-24">
                <img
                  loading="lazy"
                  decoding="async"
                  src={logo}
                  alt="CrickBro Logo"
                  className="h-12 w-12 object-contain md:h-24 md:w-24"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold tracking-tight text-[var(--text-primary)] md:text-xl">
                  CrickBro
                </h2>
                <p className="font-main text-xs text-[var(--text-secondary)]">
                  Professional Auction Platform
                </p>
              </div>
            </div>

            <p className="mb-4 max-w-md font-main text-sm leading-relaxed text-[var(--text-secondary)]">
              Revolutionizing cricket auctions with intelligent technology.
              Trusted by leagues, teams, and players across India for
              professional auction management.
            </p>

            {/* DOWNLOAD BUTTONS */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.crickbroapp&hl=en_IN"
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-2.5 py-2 text-[var(--text-primary)] shadow-sm transition-all duration-200 hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
              >
                <Download
                  size={15}
                  className="flex-shrink-0 text-[var(--primary)]"
                />
                <div className="leading-tight min-w-0">
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    Get it on
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-primary)] sm:text-sm">
                    Google Play
                  </div>
                </div>
              </a>

              <a
                href="https://apps.apple.com/in/app/crickbro-cricket-scoring-app/id6740860359"
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-2.5 py-2 text-[var(--text-primary)] shadow-sm transition-all duration-200 hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
              >
                <Apple
                  size={15}
                  className="flex-shrink-0 text-[var(--primary)]"
                />
                <div className="leading-tight min-w-0">
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    Download on
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-primary)] sm:text-sm">
                    App Store
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* ================= EXPLORE ================= */}
          <div className="flex w-full flex-col items-start md:items-center">
            <h3 className="mb-3 font-oswald text-lg text-[var(--text-primary)] md:text-xl">
              Explore
            </h3>
            <ul className="w-full space-y-1 text-left md:text-center">
              {footerLinks.Explore.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.link}
                    className="block py-1 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
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
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)]">
                <Mail className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs text-[var(--text-secondary)]">
                  Email
                </div>
                <div className="break-all font-main text-sm font-semibold text-[var(--text-primary)]">
                  {contactEmail}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)]">
                <Phone className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs text-[var(--text-secondary)]">
                  Phone
                </div>
                <div className="font-main text-sm font-semibold text-[var(--text-primary)]">
                  +91 7000742081
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--accent-light)]">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs text-[var(--text-secondary)]">
                  Office
                </div>
                <div className="font-main text-sm font-semibold text-[var(--text-primary)]">
                  Indore, India
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Socials */}
        <div className="flex flex-col gap-3 border-t border-[var(--border-card)] py-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="font-semibold text-[var(--text-primary)]">
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                >
                  <SocialIcon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="border-t border-[var(--border-card)] pt-4 text-center font-main text-xs font-medium text-[var(--text-secondary)] md:pt-5">
          © {currentYear} CrickBro. All rights reserved. | Made for cricket
          lovers in India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
