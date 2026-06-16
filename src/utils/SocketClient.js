import { io } from "socket.io-client";
import { socketUrl } from "../config/env";

let socket = null;

/* ================= CONNECT SOCKET ================= */

export const connectAuctionSocket = ({
  auctionId,
  onSnapshot,
  onUpdate,
  onAuctionPlayerStats,
  onDisconnect,
  onError,
}) => {
  // create socket instance once
  if (!socket) {
    socket = io(socketUrl, {
      path: "/auction/socket.io",
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }

  // Prevent attaching duplicate handlers
  socket.off("connect");
  socket.off("auctionUpdate");
  socket.off("auctionPlayerStats");
  socket.off("joinAuctionRoom");
  socket.off("disconnect");
  socket.off("connect_error");

  // track whether we've delivered the initial snapshot
  let snapshotDelivered = false;

  // on connect - join the auction room
  socket.on("connect", () => {
    console.log("⚡ Socket Connected:", socket?.id);
    socket?.emit("joinAuctionRoom", auctionId);
  });

  // if already connected (reused socket)
  if (socket.connected) {
    socket.emit("joinAuctionRoom", auctionId);
  }

  // join acknowledgement (initial payload)
  socket.on("joinAuctionRoom", (data) => {
    if (!snapshotDelivered) {
      snapshotDelivered = true;
      onSnapshot && onSnapshot(data);
    } else {
      onUpdate && onUpdate(data);
    }
  });

  // main update channel
  socket.on("auctionUpdate", (data) => {
    if (!snapshotDelivered) {
      snapshotDelivered = true;
      onSnapshot && onSnapshot(data);
    } else {
      onUpdate && onUpdate(data);
    }
  });

  if (onAuctionPlayerStats) {
    socket.on("auctionPlayerStats", onAuctionPlayerStats);
  }

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket Disconnected:", reason);
    onDisconnect && onDisconnect(reason);
  });

  socket.on("connect_error", (err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("❌ Socket Error:", error.message);
    onError && onError(error);
  });

  return socket;
};

/* ================= DISCONNECT SOCKET ================= */

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};

/* ================= GET SOCKET ================= */

export const getSocket = () => socket;

/** Merged stats for broadcast overlay — server answers only to this socket (not full-room auctionUpdate). */
export const requestAuctionPlayerStats = (auctionId, playerId) => {
  if (!socket?.connected || !auctionId || !playerId) return;
  socket.emit("requestAuctionPlayerStats", { auctionId, playerId });
};

