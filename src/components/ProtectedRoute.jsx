import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Home, LockKeyhole, ShieldX } from "lucide-react";
import { useLoginPopup } from "../context/LoginPopupContext";
import api from "../utils/api";

const AccessMessage = ({ loginRequired = false, message }) => {
  const Icon = loginRequired ? LockKeyhole : ShieldX;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-main)] px-4 text-[var(--text-primary)]">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-7 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-primary)] bg-[var(--accent-light)] text-[var(--primary)]">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">
          {loginRequired ? "Login Required" : "Access Denied"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
          {message}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
        >
          <Home className="h-4 w-4" />
          Go To Home Page
        </Link>
      </div>
    </main>
  );
};

const LoadingAccess = () => (
  <main className="flex min-h-screen items-center justify-center bg-[var(--bg-main)]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-primary)] border-t-[var(--primary)]" />
  </main>
);

const getAuthState = () => ({
  token: localStorage.getItem("token"),
  playerId: localStorage.getItem("playerId"),
});

const ProtectedRoute = ({ children, requireAuctionAdmin = false }) => {
  const { auctionId } = useParams();
  const { openLoginPopup } = useLoginPopup();
  const openedLoginRef = useRef(false);
  const [auth, setAuth] = useState(getAuthState);
  const [accessState, setAccessState] = useState(
    requireAuctionAdmin ? "checking" : "allowed",
  );

  const isAuthenticated = Boolean(auth.token && auth.playerId);

  useEffect(() => {
    const syncAuth = () => setAuth(getAuthState());

    window.addEventListener("storage", syncAuth);
    window.addEventListener("userLoggedIn", syncAuth);
    window.addEventListener("crickbro-auth-change", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("userLoggedIn", syncAuth);
      window.removeEventListener("crickbro-auth-change", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated || openedLoginRef.current) return;

    openedLoginRef.current = true;
    openLoginPopup();
  }, [isAuthenticated, openLoginPopup]);

  useEffect(() => {
    if (!requireAuctionAdmin || !isAuthenticated || !auctionId) {
      setAccessState(requireAuctionAdmin ? "checking" : "allowed");
      return;
    }

    let active = true;
    setAccessState("checking");

    api
      .get(`/webSiteApi/auction/checkAuctionUserRole/${auctionId}/${auth.playerId}`)
      .then((response) => {
        if (!active) return;
        setAccessState(response?.data?.data?.admin === true ? "allowed" : "denied");
      })
      .catch(() => {
        if (active) setAccessState("denied");
      });

    return () => {
      active = false;
    };
  }, [auctionId, auth.playerId, isAuthenticated, requireAuctionAdmin]);

  if (!isAuthenticated) {
    return (
      <AccessMessage
        loginRequired
        message="Please log in to continue. The login window is open for you."
      />
    );
  }

  if (accessState === "checking") return <LoadingAccess />;

  if (accessState === "denied") {
    return (
      <AccessMessage message="You do not have permission to access this auction management page." />
    );
  }

  return children;
};

export default ProtectedRoute;
