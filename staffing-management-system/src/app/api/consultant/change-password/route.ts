import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { jsonResponse } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const consultant = await prisma.consultant.findUnique({
      where: { id: session.sub },
    });

    if (!consultant) {
      return jsonResponse({ error: "Consultant not found" }, 404);
    }

    if (!consultant.passwordHash) {
      return jsonResponse({ error: "No password set for this account" }, 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, consultant.passwordHash);
    if (!isMatch) {
      return jsonResponse({ error: "Incorrect current password" }, 401);
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await prisma.consultant.update({
      where: { id: session.sub },
      data: { passwordHash: newHash },
    });

    return jsonResponse({ success: true, message: "Password updated successfully" }, 200);
  } catch (error: any) {
    console.error("Password change error:", error);
    return jsonResponse({ error: "An error occurred during password change" }, 500);
  }
}
