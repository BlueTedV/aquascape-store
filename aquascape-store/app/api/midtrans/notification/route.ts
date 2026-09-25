/**
 * Next.js Midtrans Webhook Proxy Route.
 *
 * Proxies incoming HTTP GET (health check) and POST (payment webhook) requests
 * from Midtrans directly to the upstream Laravel API backend, keeping the internal
 * API URL encapsulated and accommodating multi-tier deployments.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.AQUAKU_API_URL ?? process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/midtrans/notification`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Backend health check failed:", error);
    return NextResponse.json({
      status: "ok",
      message: "Next.js Midtrans notification webhook proxy endpoint is active.",
      backendReachable: false,
    }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${BACKEND_URL}/api/midtrans/notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Failed to forward Midtrans notification to Laravel backend:", error);
    return NextResponse.json({
      status: "error",
      message: "Failed to process payment notification. Service temporarily unavailable.",
    }, { status: 502 });
  }
}
