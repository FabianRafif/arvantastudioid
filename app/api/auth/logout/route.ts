import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await destroySession();

  const accept = req.headers.get("accept") || "";
  const isPureJson = accept.includes("application/json") && !accept.includes("text/html");

  if (isPureJson) {
    const response = NextResponse.json({ success: true, redirectUrl: "/login" });
    response.cookies.set("arvanta_session", "", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  // Redirect HTML browser form navigation directly to /login
  const loginUrl = new URL("/login", req.url);
  const response = NextResponse.redirect(loginUrl, { status: 303 });
  response.cookies.set("arvanta_session", "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(req: NextRequest) {
  await destroySession();
  const loginUrl = new URL("/login", req.url);
  const response = NextResponse.redirect(loginUrl, { status: 302 });
  response.cookies.set("arvanta_session", "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
