"use client";

import Script from "next/script";

export default function MidtransSnapScript() {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  if (!clientKey) {
    console.error("Midtrans Error: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is missing in .env.local!");
    return null;
  }

  return (
    <Script
      src={snapUrl}
      data-client-key={clientKey}
      strategy="lazyOnload"
    />
  );
}
