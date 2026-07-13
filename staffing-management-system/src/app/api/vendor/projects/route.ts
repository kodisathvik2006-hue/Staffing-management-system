import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const vendorId = session.vendorId;

    if (!vendorId) {
      return jsonResponse({ error: "Forbidden: Vendor access only" }, 403);
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
      },
      include: {
        client: {
          select: { legalName: true, firstName: true, lastName: true },
        },
        consultant: {
          select: { firstName: true, lastName: true, visaStatus: true, personalEmail: true },
        },
        documents: {
          include: {
            versions: {
              orderBy: { version: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return jsonResponse({ data: projects });
  } catch (error) {
    return errorResponse(error);
  }
}
