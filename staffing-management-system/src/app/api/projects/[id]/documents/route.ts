import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requirePermission,
  errorResponse,
  jsonResponse,
  getTenantId,
  logAudit,
  getClientIp,
  ApiError,
} from "@/lib/auth";
import {
  uploadFile,
  buildDocumentKey,
  getDownloadUrl,
} from "@/lib/s3";

type RouteParams = { params: Promise<{ id: string }> };

async function getProjectForTenant(id: string, tenantId: string) {
  const project = await prisma.project.findFirst({
    where: { id, selfEntityId: tenantId },
  });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("document:read");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id } = await params;
    await getProjectForTenant(id, tenantId);

    const documents = await prisma.projectDocument.findMany({
      where: { projectId: id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          include: {
            uploadedBy: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        versions: await Promise.all(
          doc.versions.map(async (v) => ({
            ...v,
            downloadUrl: await getDownloadUrl(v.s3Key),
          }))
        ),
      }))
    );

    return jsonResponse({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requirePermission("document:write");
    const tenantId = getTenantId(
      session,
      request.nextUrl.searchParams.get("selfEntityId")
    );
    const { id: projectId } = await params;
    await getProjectForTenant(projectId, tenantId);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string;
    const title = formData.get("title") as string;
    const isRequired = formData.get("isRequired") === "true";
    const documentId = formData.get("documentId") as string | null;

    if (!file || !documentType || !title) {
      return jsonResponse(
        { error: "file, documentType, and title are required" },
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return jsonResponse({ error: "File size exceeds 10MB limit" }, 400);
    }

    let doc = documentId
      ? await prisma.projectDocument.findFirst({
          where: { id: documentId, projectId },
        })
      : null;

    if (!doc) {
      doc = await prisma.projectDocument.create({
        data: {
          projectId,
          documentType: documentType as never,
          title,
          isRequired,
        },
      });
    }

    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId: doc.id },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latestVersion?.version ?? 0) + 1;

    const s3Key = buildDocumentKey(
      projectId,
      doc.id,
      nextVersion,
      file.name
    );
    await uploadFile(s3Key, buffer, file.type || "application/octet-stream");

    const version = await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        version: nextVersion,
        fileName: file.name,
        fileSize: buffer.length,
        mimeType: file.type || "application/octet-stream",
        s3Key,
        uploadedById: session.sub,
      },
      include: {
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await logAudit({
      selfEntityId: tenantId,
      userId: session.sub,
      action: "UPLOAD",
      resource: "document",
      resourceId: doc.id,
      metadata: { fileName: file.name, version: nextVersion },
      ipAddress: getClientIp(request),
    });

    const downloadUrl = await getDownloadUrl(s3Key);

    return jsonResponse(
      {
        data: {
          document: doc,
          version: { ...version, downloadUrl },
        },
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
