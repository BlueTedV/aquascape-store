import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/account";

  return NextResponse.redirect(
    new URL(`/login?redirect=${encodeURIComponent(next)}&message=confirm_then_login`, url.origin),
  );
}