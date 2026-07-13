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

const createConsultantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  skills: z.string().optional(),
  vendorId: z.string().cuid().optional(),
  password: z.string().min(6),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("consultant:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = createConsultantSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const { firstName, lastName, email, phone, skills, vendorId, password, status } = parsed.data;

    const existing = await prisma.consultant.findUnique({ where: { email } });
    if (existing) {
      return jsonResponse({ error: "Email is already registered" }, 400);
    }

    const hashedPassword = await hashPassword(password);
    
    const parsedSkills = skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];

    const consultant = await prisma.consultant.create({
      data: {
        firstName,
        lastName,
        email,
        personalEmail: email, // Fallback if needed
        passwordHash: hashedPassword,
        mobileNumber: phone || null,
        skills: parsedSkills,
        vendorId: vendorId || null,
        status,
        selfEntityId: tenantId,
      },
    });

    const { passwordHash: _removed, ...safeConsultant } = consultant;
    
    return jsonResponse({ data: safeConsultant }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
