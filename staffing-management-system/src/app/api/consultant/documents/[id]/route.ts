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

    // Verify ownership
    const doc = await prisma.consultantDocument.findUnique({
      where: { id },
    });

    if (!doc || doc.consultantId !== session.sub) {
      return jsonResponse({ error: "Document not found or unauthorized" }, 404);
    }

    // Delete record (In production, also delete from S3 here)
    await prisma.consultantDocument.delete({
      where: { id },
    });

    return jsonResponse({ success: true }, 200);
  } catch (error: any) {
    console.error("Document deletion error:", error);
    return jsonResponse({ error: "An error occurred during deletion" }, 500);
  }
}
