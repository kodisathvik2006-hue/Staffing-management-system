import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/pdf-generator";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const invoiceId = resolvedParams.id;

    // Check standard Invoice first
    let invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: {
          include: {
            client: true,
            consultant: { include: { vendor: true } },
            selfEntity: true,
          }
        },
        timesheet: true
      }
    });

    let isVendorInvoice = false;
    let vendorInvoice = null;

    if (!invoice) {
      // Try VendorInvoice
      vendorInvoice = await prisma.vendorInvoice.findUnique({
        where: { id: invoiceId },
        include: {
          project: {
            include: {
              client: true,
              consultant: { include: { vendor: true } },
              selfEntity: true,
            }
          },
          vendor: true,
          timesheet: true
        }
      });

      if (!vendorInvoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      isVendorInvoice = true;
    }

    const inv = isVendorInvoice ? vendorInvoice : invoice;
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const project = inv.project;
    const selfEntity = project.selfEntity;
    const client = project.client;
    const consultant = project.consultant;
    
    // RBAC Checks
    const isAdmin = session.roles.some((r) => r.role === "ADMIN" || r.role === "SUPER_ADMIN");
    const isVendor = session.roles.some((r) => r.role === "VENDOR");
    const isConsultant = session.roles?.some(r => r.role === "CONSULTANT") || (session as any).role === "consultant" || (session as any).role === "CONSULTANT";

    if (!isAdmin) {
      if (isVendor) {
        // Vendor can only see vendor invoices linked to their ID
        if (!isVendorInvoice || vendorInvoice?.vendorId !== session.sub) {
           return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else if (isConsultant) {
        // Consultant can only see invoices linked to their ID
        if (isVendorInvoice || consultant.id !== session.sub) {
           return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Prepare data for PDF
    const rate = isVendorInvoice ? project.payRatePerHour : project.clientRatePerHour;
    const hours = inv.timesheet?.hoursWorked || 0;

    const data = {
      watermark: inv.status === 'PAID' ? 'PAID' : (inv.status === 'DRAFT' ? 'DRAFT' : ''),
      company: {
        name: selfEntity.companyName,
        address: selfEntity.communicationAddress || selfEntity.registeredAddress,
        phone: selfEntity.phoneNumbers[0] || "",
        email: "support@staffing.com", // Mock or from entity if available
        website: "www.staffing.com",
        taxId: selfEntity.einNumber,
      },
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate.toLocaleDateString(),
      dueDate: inv.dueDate.toLocaleDateString(),
      paymentTerms: project.paymentTerms || "Net 30",
      client: {
        name: client.legalName,
        address: client.communicationAddress || client.registeredAddress,
        email: client.emailAddresses[0] || "",
        phone: client.phoneNumbers[0] || "",
      },
      project: {
        name: project.name,
      },
      consultant: {
        name: `${consultant.firstName} ${consultant.lastName}`,
      },
      vendor: isVendorInvoice ? {
        name: vendorInvoice!.vendor.legalName,
      } : {},
      billingPeriod: inv.timesheet ? `Week Ending ${inv.timesheet.weekEndingDate.toLocaleDateString()}` : 'Monthly',
      lineItems: [
        {
          description: "Consulting Services",
          consultantName: `${consultant.firstName} ${consultant.lastName}`,
          hours: hours.toString(),
          rate: `$${rate.toString()}`,
          amount: `$${inv.amount.toString()}`
        }
      ],
      totals: {
        subtotal: `$${inv.amount.toString()}`,
        total: inv.amount.toString(),
      },
      currency: inv.currency,
      bank: {
        name: selfEntity.bankName,
        accountName: selfEntity.companyName,
        accountNumber: "XXXX-" + selfEntity.bankAccountNumber.slice(-4),
        routingNumber: selfEntity.routingNumber,
        swift: selfEntity.swiftCode,
      }
    };

    const pdfBuffer = await generateInvoicePdf(data);

    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${inv.invoiceNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
