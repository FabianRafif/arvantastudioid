import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  });
}
