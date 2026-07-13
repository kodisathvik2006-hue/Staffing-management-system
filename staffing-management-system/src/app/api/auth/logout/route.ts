import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  await clearAuthCookies();
  // Redirect to the login selector after signing out
  return NextResponse.redirect(new URL("/select-login", request.url), 303);
}

export async function GET(request: NextRequest) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL("/select-login", request.url), 303);
}
