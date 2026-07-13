import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // Optional explicitly requested role context

    const isAdmin = session.roles?.some((r) => r.role === "ADMIN" || r.role === "SUPER_ADMIN");
    const isVendor = session.roles?.some((r) => r.role === "VENDOR");
    const isConsultant = session.roles?.some((r) => r.role === "CONSULTANT") || (session as any).role === "consultant" || (session as any).role === "CONSULTANT";

    let invoices: any[] = [];
    let vendorInvoices: any[] = [];

    // Fetch logic based on the user's highest role or the requested context
    if (isAdmin && role !== "vendor" && role !== "consultant") {
      // Admin sees everything
      invoices = await prisma.invoice.findMany({
        include: {
          project: { include: { client: true, consultant: { include: { vendor: true } } } },
          timesheet: true
        },
        orderBy: { createdAt: 'desc' }
      });
      vendorInvoices = await prisma.vendorInvoice.findMany({
        include: {
          project: { include: { client: true, consultant: { include: { vendor: true } } } },
          vendor: true,
          timesheet: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (isVendor && (role === "vendor" || !role)) {
      // Vendor sees their own VendorInvoices
      vendorInvoices = await prisma.vendorInvoice.findMany({
        where: { vendorId: session.sub },
        include: {
          project: { include: { client: true, consultant: { include: { vendor: true } } } },
          vendor: true,
          timesheet: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (isConsultant && (role === "consultant" || !role)) {
      // Consultant sees their own Invoices
      invoices = await prisma.invoice.findMany({
        where: { project: { consultantId: session.sub } },
        include: {
          project: { include: { client: true, consultant: { include: { vendor: true } } } },
          timesheet: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Unify the response format for the frontend
    const unifiedList = [
      ...invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.dueDate.toISOString(),
        issueDate: inv.issueDate.toISOString(),
        createdAt: inv.createdAt.toISOString(),
        amount: inv.amount ? inv.amount.toNumber() : 0,
        type: 'CLIENT_INVOICE',
        projectName: inv.project.name,
        clientName: inv.project.client.legalName,
        consultantName: `${inv.project.consultant.firstName} ${inv.project.consultant.lastName}`,
        vendorName: inv.project.consultant.vendor?.legalName || 'N/A',
        billingMonth: inv.issueDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        hours: inv.timesheet?.hoursWorked ? inv.timesheet.hoursWorked.toNumber() : 0,
        payRate: inv.project.payRatePerHour ? inv.project.payRatePerHour.toNumber() : 0,
        grossAmount: inv.amount ? inv.amount.toNumber() : 0,
        tax: 0,
        netAmount: inv.amount ? inv.amount.toNumber() : 0,
      })),
      ...vendorInvoices.map(vinv => ({
        id: vinv.id,
        invoiceNumber: vinv.invoiceNumber,
        currency: vinv.currency,
        status: vinv.status,
        dueDate: vinv.dueDate.toISOString(),
        issueDate: vinv.issueDate.toISOString(),
        createdAt: vinv.createdAt.toISOString(),
        amount: vinv.amount ? vinv.amount.toNumber() : 0,
        type: 'VENDOR_INVOICE',
        projectName: vinv.project.name,
        clientName: vinv.project.client.legalName,
        consultantName: `${vinv.project.consultant.firstName} ${vinv.project.consultant.lastName}`,
        vendorName: vinv.vendor.legalName,
        billingMonth: vinv.issueDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        hours: vinv.timesheet?.hoursWorked ? vinv.timesheet.hoursWorked.toNumber() : 0,
        payRate: vinv.project.payRatePerHour ? vinv.project.payRatePerHour.toNumber() : 0,
        grossAmount: vinv.amount ? vinv.amount.toNumber() : 0,
        tax: 0,
        netAmount: vinv.amount ? vinv.amount.toNumber() : 0,
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(unifiedList);
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
