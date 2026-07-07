import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Info,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Sun,
  Trophy,
  UserCircle,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/Images/Logo.png";
import { useLoginPopup } from "../context/LoginPopupContext";

const Header = ({ theme = "light", onToggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const { openLoginPopup } = useLoginPopup();

  const [mobileMenu, setMobileMenu] = useState(false);
  const verifyData = useSelector((state) => state.data?.verify);

  const token = verifyData?.token || localStorage.getItem("token");
  const playerId = localStorage.getItem("playerId");
  const isLoggedIn = Boolean(token || playerId);
  const currentPath = location.pathname;
  const isHome = currentPath === "/";

  const navOptions = [
    { label: "Home", path: "/", icon: Home },
    { label: "Auction", path: "/auction", icon: Trophy },
    { label: "Enquiry", path: "/enquiries", icon: MessageCircle },
    { label: "About Us", path: "/about", icon: Info },
    ...(isLoggedIn
      ? [{ label: "My Profile", path: "/myProfile", icon: UserCircle }]
      : []),
  ];

  const isActivePath = (path) => {
    if (path === "/") return currentPath === "/";
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileMenu(false);
  };

  const handleLogin = () => {
    openLoginPopup(() => navigate(currentPath));
    setMobileMenu(false);
  };

  const handleLogOut = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.clear();
    window.dispatchEvent(new Event("userLoggedOut"));
    navigate("/");
    setMobileMenu(false);
  };

  useEffect(() => {
    setMobileMenu(false);
  }, [currentPath]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-[color-mix(in_srgb,var(--header-bg)_92%,transparent)] shadow-[0_6px_18px_rgba(16,32,51,0.05)] backdrop-blur-[18px] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[rgba(8,186,247,0.72)] after:to-transparent after:shadow-[0_0_14px_rgba(8,186,247,0.58)]">
        <div className="container flex min-h-[76px] items-center justify-between gap-6 max-md:min-h-[68px] max-md:gap-3">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex min-h-[52px] items-center gap-3 rounded-xl px-1 py-1.5 text-left text-[var(--text-primary)] transition max-md:min-h-12 max-md:px-1"
            type="button"
            onClick={() => handleNav("/")}
            aria-label="Go to home"
          >
            <img
              className="h-20 w-20 object-contain drop-shadow-[0_8px_14px_rgba(16,32,51,0.1)] max-md:h-[42px] max-md:w-[42px]"
              src={logo}
              alt="CrickBro"
            />
            <span className="font-heading text-xl font-bold leading-none tracking-normal max-sm:hidden">
              CrickBro Auction
            </span>
          </motion.button>

          <nav
            className="ml-auto flex min-h-[46px] items-center gap-1 bg-transparent p-1 text-[15px] font-bold max-lg:hidden"
            aria-label="Primary navigation"
          >
            {navOptions.map((item) => {
              const isActive = isActivePath(item.path);

              return (
                <button
                  className={`public-nav-link relative inline-flex min-h-9 items-center font-semibold text-medium justify-center overflow-hidden rounded-lg px-[13px] text-[var(--text-secondary)] transition hover:bg-[var(--accent-light)] ${
                    isActive ? "bg-[var(--accent-light)] text-[var(--primary-strong)] after:absolute after:bottom-[5px] after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-[var(--primary)]" : ""
                  }`}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  aria-current={isActive ? "page" : undefined}
                  key={item.label}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5" ref={menuRef}>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-0 bg-transparent px-3.5 text-[13px] font-extrabold text-[var(--text-primary)] transition hover:-translate-y-px hover:bg-[var(--accent-light)] hover:text-[var(--primary)] max-md:px-3"
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
              <span className="max-md:hidden">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </button>

            {isLoggedIn ? (
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-0 bg-transparent px-3.5 text-[13px] font-extrabold text-[var(--text-primary)] transition hover:-translate-y-px hover:bg-[var(--accent-light)] hover:text-[var(--primary)] max-lg:hidden"
                type="button"
                onClick={handleLogOut}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            ) : (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-0 bg-gradient-to-b from-[var(--primary)] to-[var(--primary-strong)] px-3.5 text-[13px] font-extrabold text-white shadow-[0_8px_18px_rgba(23,105,224,0.18)] transition hover:shadow-[0_10px_22px_rgba(23,105,224,0.22)] max-lg:hidden"
                type="button"
                onClick={handleLogin}
              >
                <LogIn size={15} />
                Login
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenu((open) => !open)}
              className="hidden min-h-10 items-center justify-center gap-2 rounded-full border-0 bg-transparent px-3.5 text-[13px] font-extrabold text-[var(--text-primary)] transition hover:bg-[var(--accent-light)] hover:text-[var(--primary)] max-lg:inline-flex"
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileMenu}
              aria-controls="mobile-menu"
            >
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </motion.button>

            <AnimatePresence>
              {mobileMenu && (
                <motion.div
                  id="mobile-menu"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-4 right-4 top-[calc(100%+10px)] rounded-[14px] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] lg:hidden"
                >
                  <div className="flex flex-col gap-1">
                    {navOptions.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActivePath(item.path);

                      return (
                        <button
                          key={item.label}
                          onClick={() => handleNav(item.path)}
                          className={`public-nav-link inline-flex min-h-11 items-center gap-2.5 rounded-[10px] px-3.5 text-left text-sm font-extrabold text-[var(--text-secondary)] transition hover:bg-[var(--accent-light)] ${
                            isActive ? "bg-[var(--accent-light)] text-[var(--primary)]" : ""
                          }`}
                          type="button"
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon size={17} aria-hidden="true" />
                          {item.label}
                        </button>
                      );
                    })}

                    {isLoggedIn ? (
                      <button
                        onClick={handleLogOut}
                        className="mt-2 inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[10px] px-3.5 text-sm font-extrabold text-[var(--primary)] transition hover:bg-[var(--accent-light)]"
                        type="button"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={handleLogin}
                        className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[var(--primary)] to-[var(--primary-strong)] px-3.5 text-[13px] font-extrabold text-white shadow-[0_8px_18px_rgba(23,105,224,0.18)]"
                        type="button"
                      >
                        <LogIn size={16} />
                        Login
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </header>
      {!isHome && <div className="h-[76px] max-md:h-[68px]" aria-hidden="true" />}
    </>
  );
};

export default Header;
