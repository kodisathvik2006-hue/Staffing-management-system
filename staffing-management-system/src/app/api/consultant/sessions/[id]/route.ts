import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { jsonResponse } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;

    const sessionRecord = await prisma.consultantSession.findUnique({
      where: { id },
    });

    if (!sessionRecord || sessionRecord.consultantId !== session.sub) {
      return jsonResponse({ error: "Session not found or unauthorized" }, 404);
    }

    await prisma.consultantSession.delete({
      where: { id },
    });

    return jsonResponse({ success: true, message: "Session revoked" }, 200);
  } catch (error: any) {
    console.error("Session revocation error:", error);
    return jsonResponse({ error: "An error occurred during session revocation" }, 500);
  }
}
