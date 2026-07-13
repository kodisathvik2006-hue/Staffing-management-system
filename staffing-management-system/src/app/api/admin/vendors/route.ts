import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
  hashPassword
} from "@/lib/auth";

const createVendorSchema = z.object({
  legalName: z.string().min(2),
  companyName: z.string().optional(),
  vendorName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("vendor:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = createVendorSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const { legalName, companyName, vendorName, email, phone, password, status } = parsed.data;

    const existing = await prisma.vendor.findUnique({ where: { email } });
    if (existing) {
      return jsonResponse({ error: "Email is already registered" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    const vendor = await prisma.vendor.create({
      data: {
        legalName,
        companyName,
        vendorName,
        email,
        passwordHash: hashedPassword,
        phoneNumbers: phone ? [phone] : [],
        status,
        selfEntityId: tenantId,
      },
    });

    const { passwordHash: _removed, ...safeVendor } = vendor;
    
    return jsonResponse({ data: safeVendor }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
