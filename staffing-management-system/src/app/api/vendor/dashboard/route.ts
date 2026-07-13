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

    // 1. Fetch counts
    const [totalProjects, activeProjects, totalInvoices, unpaidInvoices] = await Promise.all([
      prisma.project.count({
        where: {
          OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
        },
      }),
      prisma.project.count({
        where: {
          status: "ACTIVE",
          OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
        },
      }),
      prisma.vendorInvoice.count({
        where: { vendorId },
      }),
      prisma.vendorInvoice.findMany({
        where: { vendorId, status: "UNPAID" },
        select: { amount: true },
      }),
    ]);

    // Calculate Pending Payments
    const pendingPayments = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    // 2. Fetch pending documents
    // A document is pending if it is required and has no uploaded versions
    const pendingDocsCount = await prisma.projectDocument.count({
      where: {
        project: {
          OR: [{ upstreamVendorId: vendorId }, { downstreamVendorId: vendorId }],
        },
        isRequired: true,
        versions: {
          none: {},
        },
      },
    });

    // 3. Fetch recent invoices and documents for recent activities
    const [recentInvoices, recentDocs] = await Promise.all([
      prisma.vendorInvoice.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          project: { select: { name: true } },
        },
      }),
      prisma.consultantDocument.findMany({
        where: {
          consultant: { vendorId },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { consultant: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    // Format activities
    const activities = [
      ...recentInvoices.map((inv) => ({
        id: inv.id,
        type: "INVOICE",
        title: `Invoice ${inv.invoiceNumber} (${inv.status})`,
        description: `Invoice for project "${inv.project.name}" in amount of $${Number(inv.amount).toFixed(2)}`,
        createdAt: inv.createdAt,
      })),
      ...recentDocs.map((doc) => ({
        id: doc.id,
        type: "DOCUMENT",
        title: `Document Uploaded: ${doc.title}`,
        description: `${doc.documentType.replace(/_/g, " ")} uploaded for consultant ${doc.consultant.firstName} ${doc.consultant.lastName}`,
        createdAt: doc.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

    return jsonResponse({
      data: {
        stats: {
          totalProjects,
          activeProjects,
          pendingPayments,
          totalInvoices,
          pendingDocuments: pendingDocsCount,
        },
        activities,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
