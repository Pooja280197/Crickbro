import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, Moon, Sun, X } from "lucide-react";
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
    { label: "Home", path: "/" },
    { label: "Auction", path: "/auction" },
    { label: "Enquiry", path: "/enquiries" },
    { label: "About Us", path: "/about" },
    ...(isLoggedIn ? [{ label: "My Profile", path: "/myProfile" }] : []),
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
      <header className="app-header fixed inset-x-0 top-0 z-50">
        <div className="container flex min-h-[76px] items-center justify-between gap-6 max-md:min-h-[68px] max-md:gap-3">
          <button
            className="app-header-brand"
            type="button"
            onClick={() => handleNav("/")}
            aria-label="Go to home"
          >
            <img
              className="app-header-logo"
              src={logo}
              alt="CrickBro"
            />
            <span className="app-header-title max-sm:hidden">
              CrickBro Auction
            </span>
          </button>

          <nav
            className="app-header-nav ml-auto max-lg:hidden"
            aria-label="Primary navigation"
          >
            {navOptions.map((item) => (
              <button
                className={`header-nav-link ${
                  isActivePath(item.path) ? "header-nav-link-active" : ""
                }`}
                type="button"
                onClick={() => handleNav(item.path)}
                key={item.label}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5" ref={menuRef}>
            <button
              className="app-header-control"
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
                className="app-header-control max-lg:hidden"
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
                className="app-header-primary-action max-lg:hidden"
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
              className="app-header-control hidden max-lg:inline-flex"
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
                  className="app-header-mobile-menu absolute left-4 right-4 top-[calc(100%+10px)] p-3 lg:hidden"
                >
                  <div className="flex flex-col gap-1">
                    {navOptions.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleNav(item.path)}
                        className={`app-mobile-nav-link ${
                          isActivePath(item.path) ? "mobile-nav-link-active" : ""
                        }`}
                        type="button"
                      >
                        {item.label}
                      </button>
                    ))}

                    {isLoggedIn ? (
                      <button
                        onClick={handleLogOut}
                        className="app-mobile-nav-link app-mobile-nav-action mt-2 justify-center"
                        type="button"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={handleLogin}
                        className="app-header-primary-action mt-2 w-full"
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

        <div className="hidden w-full px-4 md:block">
          <div className="app-header-accent-line" />
        </div>
      </header>
      {!isHome && <div className="h-[76px] max-md:h-[68px]" aria-hidden="true" />}
    </>
  );
};

export default Header;
