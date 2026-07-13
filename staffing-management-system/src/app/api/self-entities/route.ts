import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
  logAudit,
  getClientIp,
} from "@/lib/auth";
import { encrypt, decrypt, maskSensitive } from "@/lib/encryption";
import { selfEntitySchema } from "@/lib/validations";

function serializeEntity(entity: {
  id: string;
  companyName: string;
  registeredAddress: string;
  communicationAddress: string | null;
  phoneNumbers: string[];
  einNumber: string;
  bankName: string;
  bankAccountNumber: string;
  routingNumber: string;
  bankAddress: string | null;
  swiftCode: string | null;
  iban: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: entity.id,
    companyName: entity.companyName,
    registeredAddress: entity.registeredAddress,
    communicationAddress: entity.communicationAddress,
    phoneNumbers: entity.phoneNumbers,
    einNumber: maskSensitive(decrypt(entity.einNumber)),
    bankName: entity.bankName,
    bankAccountNumber: maskSensitive(decrypt(entity.bankAccountNumber)),
    routingNumber: maskSensitive(decrypt(entity.routingNumber)),
    bankAddress: entity.bankAddress,
    swiftCode: entity.swiftCode,
    iban: entity.iban,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("self_entity:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const entity = await prisma.selfEntity.findFirst({
      where: { id: tenantId },
    });

    if (!entity) {
      return jsonResponse({ error: "Organization not found" }, 404);
    }

    return jsonResponse({ data: serializeEntity(entity) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("self_entity:write");
    const body = await request.json();
    const parsed = selfEntitySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const data = parsed.data;

    const entity = await prisma.selfEntity.create({
      data: {
        companyName: data.companyName,
        registeredAddress: data.registeredAddress,
        communicationAddress: data.communicationAddress,
        phoneNumbers: data.phoneNumbers,
        einNumber: encrypt(data.einNumber),
        bankName: data.bankName,
        bankAccountNumber: encrypt(data.bankAccountNumber),
        routingNumber: encrypt(data.routingNumber),
        bankAddress: data.bankAddress,
        swiftCode: data.swiftCode,
        iban: data.iban,
      },
    });

    await logAudit({
      selfEntityId: entity.id,
      userId: session.sub,
      action: "CREATE",
      resource: "self_entity",
      resourceId: entity.id,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: serializeEntity(entity) }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requirePermission("self_entity:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );

    const body = await request.json();
    const parsed = selfEntitySchema.partial().safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        { error: "Validation failed", details: parsed.error.flatten() },
        400
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };

    if (data.einNumber) updateData.einNumber = encrypt(data.einNumber);
    if (data.bankAccountNumber)
      updateData.bankAccountNumber = encrypt(data.bankAccountNumber);
    if (data.routingNumber)
      updateData.routingNumber = encrypt(data.routingNumber);

    const entity = await prisma.selfEntity.update({
      where: { id: tenantId },
      data: updateData,
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "UPDATE",
      resource: "self_entity",
      resourceId: tenantId,
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ data: serializeEntity(entity) });
  } catch (error) {
    return errorResponse(error);
  }
}
