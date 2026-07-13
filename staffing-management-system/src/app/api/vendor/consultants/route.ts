import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/auth";
import { consultantSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const vendorId = session.vendorId;

    if (!vendorId) {
      return jsonResponse({ error: "Forbidden: Vendor access only" }, 403);
    }

    const consultants = await prisma.consultant.findMany({
      where: { vendorId },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return jsonResponse({ data: consultants });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const vendorId = session.vendorId;

    if (!vendorId) {
      return jsonResponse({ error: "Forbidden: Vendor access only" }, 403);
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return jsonResponse({ error: "Vendor organization not found" }, 404);
    }

    const body = await request.json();
    const parsed = consultantSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const consultant = await prisma.consultant.create({
      data: {
        ...parsed.data,
        vendorId,
        selfEntityId: vendor.selfEntityId,
      },
    });

    return jsonResponse({ data: consultant }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
