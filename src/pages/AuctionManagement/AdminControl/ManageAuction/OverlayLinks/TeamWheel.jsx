import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuctionTeams } from "../../../../../redux/actions";
import { RotateCcw, Check, X, Users } from "lucide-react";
import api from "../../../../../utils/api";
import logo from "/Crickbro_auction_logo-1.png";

/* ─────────── color palette ─────────── */
const SEGMENT_COLORS = [
  "#E74C3C", "#3498DB", "#2ECC71", "#F39C12",
  "#9B59B6", "#1ABC9C", "#E67E22", "#2980B9",
  "#27AE60", "#C0392B", "#8E44AD", "#16A085",
  "#D35400", "#F1C40F", "#e91e63", "#00bcd4",
];

/* ─────────── confetti particle system ─────────── */
const CONFETTI_COLORS = ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6", "#ec4899", "#f97316"];

const useConfetti = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const activeRef = useRef(false);

  const fire = useCallback((canvas) => {
    if (!canvas) return;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = canvas.parentElement.offsetWidth);
    const h = (canvas.height = canvas.parentElement.offsetHeight);

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * 100,
        y: h / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 8 + 4),
        size: Math.random() * 6 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        life: 1,
        decay: 0.008 + Math.random() * 0.008,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }
    particlesRef.current = particles;
    activeRef.current = true;

    const animate = () => {
      if (!activeRef.current) return;
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      particlesRef.current.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.vy += 0.15;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
      });
      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, w, h);
        activeRef.current = false;
      }
    };
    animate();
  }, []);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  return { fire, stop };
};

/* ═══════════════════════════════════════ */

const TeamWheel = () => {
  const { auctionId } = useParams();
  const dispatch = useDispatch();
  const wheelCanvasRef = useRef(null);
  const mainAreaRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const animRef = useRef(null);
  const confetti = useConfetti();

  const loading = useSelector((state) => state?.loading?.auctionTeams);
  const teamsData = useSelector((state) => state?.data?.auctionTeams);

  const [allTeams, setAllTeams] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [spinCount, setSpinCount] = useState(0);
  const [tournament, setTournament] = useState(null);
  const [wheelPx, setWheelPx] = useState(560);

  const angleRef = useRef(0);

  useEffect(() => {
    if (!auctionId) return;
    const fetchAuction = async () => {
      try {
        const response = await api.get(`/webSiteApi/auction/getAuctionById/${auctionId}`);
        if (response.data.success) {
          const auctionData = response.data.data;
          setTournament(auctionData.tournamentId || auctionData.tournament);
        }
      } catch (error) {
        console.error("Error fetching auction:", error);
      }
    };
    fetchAuction();
  }, [auctionId]);

  /* wheel only shows selected teams */
  const wheelTeams = useMemo(
    () => allTeams.filter((t) => selectedIds.has(t.id)),
    [allTeams, selectedIds],
  );

  useEffect(() => {
    if (auctionId) dispatch(getAuctionTeams(auctionId, 1, 200));
  }, [auctionId, dispatch]);

  useEffect(() => {
    if (!teamsData) return;
    const listCandidates = [
      teamsData?.data?.data,
      teamsData?.data?.selectedTeamToAuction,
      teamsData?.selectedTeamToAuction,
      teamsData?.teams,
      teamsData?.data,
      teamsData,
    ];
    const list = listCandidates.find(Array.isArray) || [];
    const parsed = (Array.isArray(list) ? list : []).map((item) => {
      const t = item?.teamDoc || item?.team || item?.teamId || item;
      return {
        id:
          t?._id ||
          item?.teamId?._id ||
          item?.teamId ||
          item?._id ||
          item?.id,
        name:
          t?.name ||
          t?.teamName ||
          item?.teamName ||
          item?.name ||
          "Team",
        logo:
          t?.logo ||
          t?.teamLogo ||
          t?.image ||
          item?.logo ||
          item?.teamLogo ||
          item?.image ||
          "",
      };
    }).filter((team) => team.id);
    setAllTeams(parsed);
    // select all by default
    setSelectedIds(new Set(parsed.map((t) => t.id)));
  }, [teamsData]);

  /* ─── toggle team selection ─── */
  const toggleTeam = (id) => {
    if (spinning) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // reset wheel angle & winner when selection changes
    angleRef.current = 0;
    setWinner(null);
    setShowResult(false);
  };

  const selectAll = () => {
    if (spinning) return;
    setSelectedIds(new Set(allTeams.map((t) => t.id)));
    angleRef.current = 0;
    setWinner(null);
    setShowResult(false);
  };

  const deselectAll = () => {
    if (spinning) return;
    setSelectedIds(new Set());
    setWinner(null);
    setShowResult(false);
  };

  /* ─── preload team logos ─── */
  useEffect(() => {
    if (wheelTeams.length === 0) return;
    const imgs = {};
    let loaded = 0;
    const total = wheelTeams.length;
    wheelTeams.forEach((t) => {
      if (!t.logo) { loaded++; if (loaded === total) setLoadedImages({ ...imgs }); return; }
      const img = new Image();
      img.onload = () => { imgs[t.id] = img; loaded++; if (loaded === total) setLoadedImages({ ...imgs }); };
      img.onerror = () => {
        /* retry without crossOrigin if CORS fails */
        const retry = new Image();
        retry.onload = () => { imgs[t.id] = retry; loaded++; if (loaded === total) setLoadedImages({ ...imgs }); };
        retry.onerror = () => { loaded++; if (loaded === total) setLoadedImages({ ...imgs }); };
        retry.src = t.logo;
      };
      img.crossOrigin = "anonymous";
      img.src = t.logo;
    });
    if (wheelTeams.every((t) => !t.logo)) setLoadedImages({});
  }, [wheelTeams]);

  /* ─── draw wheel ─── */
  const drawWheel = useCallback(
    (angle) => {
      const canvas = wheelCanvasRef.current;
      if (!canvas || wheelTeams.length === 0) return;
      const ctx = canvas.getContext("2d");
      const size = canvas.width;
      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 12;
      const segAngle = (2 * Math.PI) / wheelTeams.length;

      ctx.clearRect(0, 0, size, size);

      /* outer glow ring */
      ctx.save();
      ctx.shadowColor = "rgba(245,158,11,0.35)";
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.restore();

      /* segments */
      wheelTeams.forEach((team, i) => {
        const startA = angle + i * segAngle;
        const endA = startA + segAngle;
        const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startA, endA);
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
        grad.addColorStop(0, color + "dd");
        grad.addColorStop(0.7, color);
        grad.addColorStop(1, color + "bb");
        ctx.fillStyle = grad;
        ctx.fill();

        /* white divider */
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const ex = cx + Math.cos(startA) * r;
        const ey = cy + Math.sin(startA) * r;
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* logo */
        const midA = startA + segAngle / 2;
        const logoR = r * 0.65;
        const lx = cx + Math.cos(midA) * logoR;
        const ly = cy + Math.sin(midA) * logoR;
        const img = loadedImages[team.id];
        const logoSize = Math.min(r * 0.35, 72);

        if (img) {
          ctx.save();
          /* white circle background */
          ctx.beginPath();
          ctx.arc(lx, ly, logoSize / 2 + 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(0,0,0,0.35)";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
          /* border ring */
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 2.5;
          ctx.stroke();
          /* clip & draw logo */
          ctx.beginPath();
          ctx.arc(lx, ly, logoSize / 2 + 3, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(img, lx - logoSize / 2, ly - logoSize / 2, logoSize, logoSize);
          ctx.restore();
        } else {
          /* fallback initial circle */
          ctx.save();
          ctx.beginPath();
          ctx.arc(lx, ly, logoSize / 2 + 3, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.font = `bold ${Math.max(16, logoSize * 0.45)}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(team.name.charAt(0), lx, ly);
          ctx.restore();
        }

        /* team name */
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(midA);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${Math.max(10, Math.min(15, r * 0.078))}px Inter, system-ui, sans-serif`;
        const displayName = team.name.length > 12 ? team.name.slice(0, 11) + "…" : team.name;
        const tx = r * 0.35;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.lineWidth = Math.max(2.5, r * 0.014);
        ctx.strokeStyle = "rgba(0,0,0,0.82)";
        ctx.strokeText(displayName, tx, 0);
        ctx.fillStyle = "#fafafa";
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = 5;
        ctx.fillText(displayName, tx, 0);
        ctx.restore();
      });

      /* gold outer ring with pegs */
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
      const ringGrad = ctx.createLinearGradient(0, 0, size, size);
      ringGrad.addColorStop(0, "#fbbf24");
      ringGrad.addColorStop(0.3, "#f59e0b");
      ringGrad.addColorStop(0.6, "#d97706");
      ringGrad.addColorStop(1, "#fbbf24");
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 8;
      ctx.stroke();

      /* pegs */
      const pegCount = Math.max(wheelTeams.length, 12);
      for (let i = 0; i < pegCount; i++) {
        const a = (2 * Math.PI * i) / pegCount;
        const px = cx + Math.cos(a) * (r + 4);
        const py = cy + Math.sin(a) * (r + 4);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#fef3c7";
        ctx.fill();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      /* center hub */
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.13, 0, 2 * Math.PI);
      const cGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, r * 0.13);
      cGrad.addColorStop(0, "#fef3c7");
      cGrad.addColorStop(0.5, "#fbbf24");
      cGrad.addColorStop(1, "#d97706");
      ctx.fillStyle = cGrad;
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 3;
      ctx.stroke();
    },
    [wheelTeams, loadedImages],
  );

  const spinBtnPx = useMemo(
    () => Math.round(Math.min(78, Math.max(52, wheelPx * 0.109))),
    [wheelPx],
  );

  const pointerPx = useMemo(() => {
    const ptrTop = Math.round(wheelPx * 0.064);
    const ptrSide = Math.round(ptrTop * 0.5);
    const ptrInnerTop = Math.round(ptrTop * 0.675);
    const ptrInnerSide = Math.round(ptrInnerTop * 0.48);
    return { ptrTop, ptrSide, ptrInnerTop, ptrInnerSide };
  }, [wheelPx]);

  /* Fit wheel to viewport; when result is visible, reserve space for winner panel */
  useEffect(() => {
    const el = mainAreaRef.current;
    if (!el) return;

    const measure = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      const pad = 16;
      const hasResult = showResult && winner;
      const wide = w >= 768;
      let maxD;

      if (hasResult && wide) {
        const resultReserve = Math.min(420, Math.max(300, w * 0.38));
        maxD = Math.min(w - resultReserve - pad * 2, h - pad * 2, 920);
      } else if (hasResult && !wide) {
        maxD = Math.min(w - pad * 2, h - 300, 920);
      } else {
        maxD = Math.min(w - pad * 2, h - pad * 2, 920);
      }

      const next = Math.max(240, Math.floor(maxD));
      setWheelPx((prev) => (prev === next ? prev : next));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [showResult, winner]);

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [drawWheel, wheelPx]);

  /* ─── spin logic ─── */
  const spin = () => {
    if (spinning || wheelTeams.length < 2) return;
    setSpinning(true);
    setWinner(null);
    setShowResult(false);
    confetti.stop();

    const winnerIdx = Math.floor(Math.random() * wheelTeams.length);
    const segAngle = (2 * Math.PI) / wheelTeams.length;

    const normalizedStart = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const fullRotations = 7 + Math.floor(Math.random() * 5);
    const stopAngle = -(winnerIdx * segAngle + segAngle / 2) - Math.PI / 2;
    const normalizedStop = ((stopAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const targetAngle = normalizedStart + fullRotations * 2 * Math.PI + (normalizedStop - normalizedStart);

    const startAngle = normalizedStart;
    angleRef.current = startAngle;
    const totalDelta = targetAngle - startAngle;
    const duration = 5500 + Math.random() * 2500;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(t);
      const current = startAngle + totalDelta * eased;

      angleRef.current = current;
      drawWheel(current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWinner(wheelTeams[winnerIdx]);
        setSpinCount((c) => c + 1);
        setTimeout(() => {
          setShowResult(true);
          if (confettiCanvasRef.current) confetti.fire(confettiCanvasRef.current);
        }, 200);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => { cancelAnimationFrame(animRef.current); confetti.stop(); }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-400" />
      </div>
    );
  }

  if (allTeams.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 text-center">
        <p className="text-lg font-semibold text-slate-100">No teams available</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">Add teams to the auction first.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen min-h-0 w-full flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Confetti canvas overlay */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 z-30 pointer-events-none"
      />

      {/* Header — larger logos, minimal padding */}
      <header className="relative z-40 flex w-full flex-shrink-0 items-center gap-2 border-b border-amber-500/25 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-2 py-2 shadow-lg shadow-black/50 sm:gap-3 sm:px-3 sm:py-2 md:px-4">
        <div className="flex shrink-0 items-center justify-start">
          {tournament?.logo ? (
            <img
              src={tournament.logo}
              alt="Tournament logo"
              className="h-16 w-auto max-w-[min(38vw,11.5rem)] rounded-md object-contain ring-1 ring-white/25 sm:h-[4.75rem] sm:max-w-[13rem] md:h-[5.25rem] md:max-w-[14rem]"
            />
          ) : (
            <span className="text-3xl opacity-40" aria-hidden>
              🏏
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 text-center">
          {tournament?.name ? (
            <h1 className="line-clamp-2 text-balance text-base font-black leading-tight tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_12px_rgba(0,0,0,0.65)]">
              {tournament.name}
            </h1>
          ) : (
            <h1 className="text-sm font-bold text-slate-400 sm:text-base">Team wheel</h1>
          )}
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400/90 sm:text-[11px]">
            Fortune wheel
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-end">
          <div className="rounded-md bg-white p-1 shadow-md ring-1 ring-white/45">
            <img
              src={logo}
              alt="Crickbro Auction"
              className="h-16 w-auto max-w-[min(44vw,13rem)] object-contain sm:h-[4.75rem] sm:max-w-[15rem] md:h-[5.25rem] md:max-w-[16rem]"
            />
          </div>
        </div>
      </header>

      {/* ─── Main: wheel centered & max size; with result → wheel left / top, winner beside ─── */}
      <div
        ref={mainAreaRef}
        className="relative flex flex-1 min-h-0 w-full flex-col overflow-hidden bg-[radial-gradient(ellipse_85%_65%_at_50%_38%,rgba(245,158,11,0.14),transparent_58%)] px-2 pb-[100px] sm:px-4"
      >
        <div
          className={`flex min-h-0 w-full flex-1 items-center justify-center transition-all duration-500 ease-out gap-4 md:gap-8 lg:gap-10 ${
            showResult && winner ? "flex-col md:flex-row md:items-center md:justify-center" : "flex-col"
          }`}
        >
          {/* Wheel column */}
          <div className="flex flex-col items-center justify-center gap-3 shrink-0 min-w-0">
            {wheelTeams.length < 2 ? (
              <div
                className="flex max-w-full flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-600 bg-gradient-to-br from-slate-800/90 to-slate-900/95 shadow-inner shadow-black/40"
                style={{ width: wheelPx, height: wheelPx }}
              >
                <Users className="mb-3 h-12 w-12 text-amber-500/70" />
                <p className="px-8 text-center text-base font-medium text-slate-200">
                  Select at least 2 teams
                </p>
                <p className="mt-1 text-sm text-slate-500">to spin the wheel</p>
              </div>
            ) : (
              <div className="relative shrink-0" style={{ width: wheelPx, height: wheelPx }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: `${pointerPx.ptrSide}px solid transparent`,
                      borderRight: `${pointerPx.ptrSide}px solid transparent`,
                      borderTop: `${pointerPx.ptrTop}px solid #dc2626`,
                      filter: "drop-shadow(0 4px 10px rgba(220,38,38,0.4))",
                    }}
                  />
                  <div
                    className="absolute top-[2px] left-1/2 -translate-x-1/2"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: `${pointerPx.ptrInnerSide}px solid transparent`,
                      borderRight: `${pointerPx.ptrInnerSide}px solid transparent`,
                      borderTop: `${pointerPx.ptrInnerTop}px solid #fbbf24`,
                    }}
                  />
                </div>

                {spinning && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      boxShadow: "0 0 80px rgba(245,158,11,0.4), 0 0 150px rgba(245,158,11,0.15)",
                    }}
                  />
                )}

                <canvas
                  ref={wheelCanvasRef}
                  width={wheelPx}
                  height={wheelPx}
                  className="block rounded-full max-w-full h-auto"
                  style={{ width: wheelPx, height: wheelPx }}
                />

                <button
                  type="button"
                  onClick={spin}
                  disabled={spinning || wheelTeams.length < 2}
                  className={`absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full font-black uppercase tracking-wider
                    transition-all duration-300 border-[3px] border-white/60 flex items-center justify-center
                    ${spinning
                      ? "bg-gradient-to-br from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed scale-90 shadow-md"
                      : "bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 text-white hover:scale-[1.12] hover:shadow-2xl active:scale-95 shadow-xl"
                    }`}
                  style={{
                    width: spinBtnPx,
                    height: spinBtnPx,
                    fontSize: Math.max(10, Math.round(spinBtnPx * 0.2)),
                    ...(!spinning
                      ? {
                          animation: "pulse 2s infinite",
                          boxShadow: "0 0 20px rgba(245,158,11,0.5), 0 4px 15px rgba(0,0,0,0.2)",
                        }
                      : {}),
                  }}
                >
                  {spinning ? "⏳" : "SPIN"}
                </button>
              </div>
            )}

            <div className="flex items-center gap-4">
              {winner && !spinning && (
                <button
                  type="button"
                  onClick={spin}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Spin Again
                </button>
              )}
            </div>
          </div>

          {showResult && winner && (
            <div
              className="w-full max-w-[min(100%,380px)] shrink-0"
              style={{ animation: "fadeSlide 0.45s ease-out both" }}
            >
              <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden w-full min-w-0">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                    backgroundSize: "200% 200%",
                    animation: "shimmer 2s infinite",
                  }}
                />

                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute bg-white rounded-full"
                      style={{
                        width: `${2 + Math.random() * 4}px`,
                        height: `${2 + Math.random() * 4}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `twinkle ${1 + Math.random() * 2}s ${Math.random() * 2}s infinite`,
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <div className="text-5xl mb-3 animate-bounce">🏆</div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-[0.25em] mb-4">
                    Winner
                  </p>
                  {winner.logo ? (
                    <img
                      src={winner.logo}
                      alt={winner.name}
                      className="w-32 h-32 rounded-2xl mx-auto border-4 border-white/80 shadow-xl mb-4 object-cover"
                      style={{ animation: "popIn 0.5s ease-out" }}
                    />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-2xl mx-auto border-4 border-white/80 shadow-xl mb-4 bg-white/20 flex items-center justify-center text-4xl font-bold text-white"
                      style={{ animation: "popIn 0.5s ease-out" }}
                    >
                      {winner.name.charAt(0)}
                    </div>
                  )}
                  <h3
                    className="text-2xl font-black text-white break-words px-1"
                    style={{ animation: "popIn 0.6s ease-out 0.1s both" }}
                  >
                    {winner.name}
                  </h3>
                  <div className="mt-3 text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                    Selected by Fortune Wheel
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM FIXED: Team Selection ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700 bg-slate-950 shadow-[0_-8px_32px_rgba(0,0,0,0.45)]">
        {/* Top bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] px-4 py-2.5">
          <div className="flex items-center gap-2 text-white">
            <Users className="h-4 w-4 shrink-0 opacity-95" />
            <span className="text-sm font-bold tracking-tight">Select teams</span>
            <span className="ml-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-bold text-white ring-1 ring-white/25">
              {selectedIds.size} / {allTeams.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              disabled={spinning}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-lg bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-40"
            >
              <Check className="w-3 h-3" />
              All
            </button>
            <button
              onClick={deselectAll}
              disabled={spinning}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-lg bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-40"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        {/* Scrollable team chips */}
        <div className="flex gap-2 overflow-x-auto bg-slate-900/95 px-3 py-2.5 sm:px-4">
          {allTeams.map((team) => {
            const isSelected = selectedIds.has(team.id);
            const isWinner = winner?.id === team.id;
            const colorIdx = wheelTeams.findIndex((wt) => wt.id === team.id);
            return (
              <div
                key={team.id}
                onClick={() => toggleTeam(team.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200
                  ${isWinner
                    ? "border-amber-400 bg-gradient-to-r from-amber-500/25 to-orange-600/20 shadow-md ring-2 ring-amber-400/40"
                    : isSelected
                      ? "border-emerald-500/70 bg-slate-800 text-slate-100 shadow-sm ring-1 ring-emerald-500/30 hover:border-emerald-400"
                      : "border-slate-600/80 bg-slate-800/40 text-slate-400 opacity-95 hover:border-slate-500 hover:text-slate-300"
                  }`}
              >
                {/* checkbox */}
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                    isSelected ? "border-emerald-400 bg-emerald-500" : "border-slate-500 bg-slate-900"
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                </div>

                {/* color dot */}
                {isSelected && colorIdx >= 0 && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SEGMENT_COLORS[colorIdx % SEGMENT_COLORS.length] }}
                  />
                )}

                {/* logo */}
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="h-6 w-6 shrink-0 rounded-md border border-slate-600 object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-700 text-[9px] font-bold text-slate-300">
                    {team.name.charAt(0)}
                  </div>
                )}

                {/* name */}
                <span
                  className={`whitespace-nowrap text-xs font-semibold ${
                    isSelected || isWinner ? "text-slate-100" : "text-slate-400"
                  }`}
                >
                  {team.name}
                </span>

                {isWinner && <span className="text-sm">🏆</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom keyframes */}
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translate3d(12px, 10px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% -200%; }
          100% { background-position: 200% 200%; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%      { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          60%  { transform: scale(1.1) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default TeamWheel;
