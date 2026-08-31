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
    return NextResponse.json({
      status: "ok",
      message: "Next.js Midtrans notification webhook proxy endpoint is active.",
      backendReachable: false,
      error: error instanceof Error ? error.message : String(error),
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
      message: "Failed to forward webhook to backend: " + (error instanceof Error ? error.message : String(error)),
    }, { status: 502 });
  }
}
