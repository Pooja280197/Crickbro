export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ENABLED_PAYMENT_METHODS = {
  upi: true,
  card: true,
  netbanking: true,
  wallet: true,
};

export const isMobileBrowser = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";
  const mobilePattern =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  const hasTouchScreen = navigator.maxTouchPoints > 0;

  return mobilePattern.test(userAgent) && hasTouchScreen;
};

export const getRazorpayPaymentConfig = () => {
  if (isMobileBrowser()) {
    return {
      method: ENABLED_PAYMENT_METHODS,
      upi: {
        flow: "intent",
      },
    };
  }

  return {
    method: ENABLED_PAYMENT_METHODS,
    upi: {
      flow: "redirect",
    },
  };
};