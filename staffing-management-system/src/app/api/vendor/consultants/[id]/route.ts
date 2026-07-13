import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/auth";
import { consultantSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const vendorId = session.vendorId;

    if (!vendorId) {
      return jsonResponse({ error: "Forbidden: Vendor access only" }, 403);
    }

    const { id } = await params;
    const consultant = await prisma.consultant.findFirst({
      where: { id, vendorId },
    });

    if (!consultant) {
      return jsonResponse({ error: "Consultant not found" }, 404);
    }

    return jsonResponse({ data: consultant });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const vendorId = session.vendorId;

    if (!vendorId) {
      return jsonResponse({ error: "Forbidden: Vendor access only" }, 403);
    }

    const { id } = await params;
    const existing = await prisma.consultant.findFirst({
      where: { id, vendorId },
    });

    if (!existing) {
      return jsonResponse({ error: "Consultant not found" }, 404);
    }

    const body = await request.json();
    const parsed = consultantSchema.partial().safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const updated = await prisma.consultant.update({
      where: { id },
      data: parsed.data,
    });

    return jsonResponse({ data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
