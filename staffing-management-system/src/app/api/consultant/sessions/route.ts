import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { jsonResponse } from "@/lib/auth";

// Delete all sessions for the consultant (except current one ideally, but for now we'll delete all)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    await prisma.consultantSession.deleteMany({
      where: { consultantId: session.sub },
    });

    return jsonResponse({ success: true, message: "Logged out from all devices" }, 200);
  } catch (error: any) {
    console.error("Session deletion error:", error);
    return jsonResponse({ error: "An error occurred during session deletion" }, 500);
  }
}
