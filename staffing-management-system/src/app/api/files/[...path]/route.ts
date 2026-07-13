import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireAuth, errorResponse } from "@/lib/auth";

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();
    const { path: pathSegments } = await params;
    const filePath = path.join(process.cwd(), "uploads", ...pathSegments);

    const resolved = path.resolve(filePath);
    const uploadsDir = path.resolve(path.join(process.cwd(), "uploads"));
    if (!resolved.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[ext] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path.basename(resolved)}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
