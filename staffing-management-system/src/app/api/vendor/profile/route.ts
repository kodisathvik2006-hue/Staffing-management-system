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

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return jsonResponse({ error: "Vendor not found" }, 404);
    }

    return jsonResponse({ data: vendor });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const vendorId = session.vendorId;

    if (!vendorId) {
      return jsonResponse({ error: "Forbidden: Vendor access only" }, 403);
    }

    const body = await request.json();
    
    // Only allow updating contact details
    const updateData = {
      registeredAddress: body.registeredAddress,
      communicationAddress: body.communicationAddress,
      contactNames: body.contactNames,
      emailAddresses: body.emailAddresses,
      phoneNumbers: body.phoneNumbers,
    };

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: updateData,
    });

    return jsonResponse({ data: vendor });
  } catch (error) {
    return errorResponse(error);
  }
}
