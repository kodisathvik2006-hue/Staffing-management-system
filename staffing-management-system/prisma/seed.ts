import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";
import { encrypt } from "../src/lib/encryption";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.projectStatusHistory.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.projectSalesperson.deleteMany();
  await prisma.vendorInvoice.deleteMany();
  await prisma.consultantDocument.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.project.deleteMany();
  await prisma.templateRequiredDocument.deleteMany();
  await prisma.templateCommissionDefault.deleteMany();
  await prisma.projectTemplate.deleteMany();
  await prisma.consultant.deleteMany();
  await prisma.salesperson.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userSelfEntityRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.selfEntity.deleteMany();

  const entity = await prisma.selfEntity.create({
    data: {
      id: "seed-entity-001",
      companyName: "Acme Staffing LLC",
      registeredAddress: "123 Business Park Dr, Austin, TX 78701",
      communicationAddress: "123 Business Park Dr, Austin, TX 78701",
      phoneNumbers: ["+1-512-555-0100"],
      einNumber: encrypt("12-3456789"),
      bankName: "Chase Bank",
      bankAccountNumber: encrypt("9876543210"),
      routingNumber: encrypt("021000021"),
      bankAddress: "270 Park Ave, New York, NY 10017",
    },
  });

  const passwordHash = await hashPassword("Admin@12345");

  const admin = await prisma.user.create({
    data: {
      email: "admin@staffing.com",
      passwordHash,
      firstName: "System",
      lastName: "Admin",
      entityRoles: {
        create: {
          selfEntityId: entity.id,
          role: "ADMIN",
        },
      },
    },
  });

  const client = await prisma.client.create({
    data: {
      selfEntityId: entity.id,
      legalName: "TechCorp Inc",
      contactNames: ["Jane Client"],
      emailAddresses: ["billing@techcorp.com"],
      phoneNumbers: ["+1-555-0101"],
    },
  });

  const vendor = await prisma.vendor.create({
    data: {
      selfEntityId: entity.id,
      legalName: "Global Talent Partners",
      shortName: "GTP",
      contactNames: ["Mike Vendor"],
      emailAddresses: ["ops@gtp.com"],
      phoneNumbers: ["+1-555-0202"],
      email: "vendor@gtp.com",
      passwordHash: await hashPassword("Vendor@12345"),
    },
  });

  const consultant = await prisma.consultant.create({
    data: {
      selfEntityId: entity.id,
      vendorId: vendor.id,
      fullName: "Raj Kumar",
      visaStatus: "H1B",
      personalEmail: "raj.kumar@email.com",
      mobileNumber: "+1-555-0303",
      address: "456 Oak St, Dallas, TX",
      email: "consultant@gtp.com",
      passwordHash: await hashPassword("Consultant@12345"),
    },
  });

  const salesperson = await prisma.salesperson.create({
    data: {
      selfEntityId: entity.id,
      fullName: "Sarah Sales",
      personalEmail: "sarah@staffing.com",
      mobileNumber: "+1-555-0404",
    },
  });

  const project = await prisma.project.create({
    data: {
      selfEntityId: entity.id,
      name: "TechCorp - Java Developer",
      clientId: client.id,
      consultantId: consultant.id,
      upstreamVendorId: vendor.id,
      status: "ACTIVE",
      startDate: new Date("2025-01-15"),
      clientRatePerHour: 95,
      payRatePerHour: 65,
      invoiceEmail: "billing@techcorp.com",
      paymentTerms: "Net 30",
      salespeople: {
        create: { salespersonId: salesperson.id },
      },
      commissionRules: {
        create: {
          salespersonId: salesperson.id,
          type: "PERCENT_MARKUP",
          currency: "USD",
          percent: 10,
        },
      },
      statusHistory: {
        create: {
          toStatus: "DRAFT",
          changedBy: admin.id,
          reason: "Project created",
        },
      },
    },
  });

  await prisma.projectTemplate.create({
    data: {
      selfEntityId: entity.id,
      name: "Standard US Client Placement",
      description: "Default template for US client consultant placements",
      paymentTerms: "Net 30",
      defaultClientRate: 90,
      defaultPayRate: 60,
      currency: "USD",
      markupTarget: 30,
      commissionDefaults: {
        create: {
          type: "PERCENT_MARKUP",
          currency: "USD",
          percent: 10,
        },
      },
      requiredDocuments: {
        create: [
          { documentType: "CLIENT_MSA" },
          { documentType: "CLIENT_SOW" },
          { documentType: "CONSULTANT_NDA" },
        ],
      },
    },
  });

  // Create Vendor Login User
  const vendorPasswordHash = await hashPassword("Vendor@12345");
  const vendorUser = await prisma.user.create({
    data: {
      email: "vendor@gtp.com",
      passwordHash: vendorPasswordHash,
      firstName: "GTP",
      lastName: "Operations",
      vendorId: vendor.id,
      entityRoles: {
        create: {
          selfEntityId: entity.id,
          role: "VENDOR",
        },
      },
    },
  });

  // Seed Vendor Invoices
  await prisma.vendorInvoice.create({
    data: {
      vendorId: vendor.id,
      projectId: project.id,
      invoiceNumber: "V-INV-2025-001",
      amount: 10400.00, // 160 hours @ $65/hr
      currency: "USD",
      issueDate: new Date("2025-02-01"),
      dueDate: new Date("2025-03-03"),
      status: "PAID",
      paidAt: new Date("2025-03-01"),
    },
  });

  await prisma.vendorInvoice.create({
    data: {
      vendorId: vendor.id,
      projectId: project.id,
      invoiceNumber: "V-INV-2025-002",
      amount: 10400.00, // 160 hours @ $65/hr
      currency: "USD",
      issueDate: new Date("2025-03-01"),
      dueDate: new Date("2025-04-01"),
      status: "UNPAID",
    },
  });

  // Seed Notifications
  await prisma.notification.create({
    data: {
      userId: vendorUser.id,
      title: "Welcome to GTP Vendor Portal",
      message: "You can now view your projects, consultants, and submit invoices here.",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: vendorUser.id,
      title: "Invoice V-INV-2025-001 Paid",
      message: "Your invoice V-INV-2025-001 of $10,400.00 has been paid successfully.",
      isRead: false,
    },
  });

  console.log("Seed complete!");
  console.log("Login: admin@staffing.com / Admin@12345");
  console.log("Vendor Login: vendor@gtp.com / Vendor@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
