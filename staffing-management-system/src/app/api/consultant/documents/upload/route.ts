import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { jsonResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const documentType = formData.get("documentType") as string;
    const notes = formData.get("notes") as string;
    const file = formData.get("file") as File;

    if (!title || !documentType || !file) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    // Since this is a local mock, we won't physically write to disk to avoid 
    // permissions/storage issues in this environment, but we will create the DB record.
    // In production, you would upload `file` to AWS S3 here and get the Key.

    const newDoc = await prisma.consultantDocument.create({
      data: {
        consultantId: session.sub,
        title,
        documentType,
        notes: notes || null,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        s3Key: `mock-s3-key/${file.name}`,
        uploadedById: session.sub,
        status: "Pending",
      },
    });

    return jsonResponse({ success: true, document: newDoc }, 201);
  } catch (error: any) {
    console.error("Document upload error:", error);
    return jsonResponse({ error: "An error occurred during upload" }, 500);
  }
}
