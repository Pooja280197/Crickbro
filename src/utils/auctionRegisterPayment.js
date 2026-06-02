import api from "./api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * IDs for GET playerRegistrationDetails after enroll / Razorpay success.
 * Uses enroll API payload first, then route param, then localStorage playerId.
 */
export function resolveAuctionRegistrationPollIds(data, routeAuctionId) {
  const auctionId = String(
    data?.auctionDetails?.auctionId ??
      data?.auctionDetails?._id ??
      routeAuctionId ??
      "",
  ).trim();
  const stored =
    typeof window !== "undefined"
      ? String(localStorage.getItem("playerId") || "").trim()
      : "";
  const playerId = String(data?.player?._id ?? stored).trim();

  return { auctionId, playerId };
}

export async function recoverPaidAuctionRegistration({
  response,
  data,
  routeAuctionId,
}) {
  const { auctionId, playerId } = resolveAuctionRegistrationPollIds(
    data,
    routeAuctionId,
  );
  const paymentId = response?.razorpay_payment_id || "";
  const orderId =
    response?.razorpay_order_id || data?.paymentDetails?.orderId || "";

  if (!auctionId || !playerId || !paymentId) {
    return { ok: false, reason: "missing_ids" };
  }

  const payload = {
    auctionId,
    playerId,
    paymentId,
    orderId,
    categoryId: data?.player?.categoryId || null,
    slotId: data?.player?.slotId || null,
    sessionId: data?.player?.sessionId || null,
    paymentDetails: {
      ...(data?.paymentDetails || {}),
      paymentId,
      orderId,
      signature: response?.razorpay_signature || null,
    },
  };

  try {
    const res = await api.post(
      "/webSiteApi/auction/recoverPaidPlayerRegistration",
      payload,
    );
    return { ok: true, data: res?.data?.data ?? res?.data };
  } catch (error) {
    return {
      ok: false,
      reason: error?.response?.data?.message || error?.message || "failed",
      error,
    };
  }
}

/**
 * After Razorpay checkout succeeds, registration is completed by the server
 * webhook only. Poll registration details until payment shows completed (or timeout).
 */
export async function waitForAuctionRegistrationViaWebhook({
  auctionId,
  playerId,
  maxAttempts = 45,
  intervalMs = 2000,
}) {
  if (!auctionId || !playerId) {
    return { ok: false, timeout: true, reason: "missing_ids" };
  }

  const path = `/webSiteApi/auction/playerRegistrationDetails/${auctionId}/${playerId}`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await api.get(path);
      const data = res?.data?.data ?? res?.data;
      const payStatus = String(data?.paymentDetails?.status || "").toLowerCase();
      if (payStatus === "completed") {
        return { ok: true, data };
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        return {
          ok: false,
          authError: true,
          reason: status === 401 ? "unauthorized" : "forbidden",
        };
      }
      if (status && status !== 404) {
        throw err;
      }
    }
    await sleep(intervalMs);
  }

  return { ok: false, timeout: true };
}
