import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding multiple test users for Admin, Vendor, and Consultant...");

  const entity = await prisma.selfEntity.findFirst();
  if (!entity) throw new Error("No SelfEntity found!");

  // Admins
  const adminEmails = ["admin1@gtp.com", "admin2@gtp.com", "admin3@gtp.com"];
  for (const email of adminEmails) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          passwordHash: await hashPassword("Admin@12345"),
          firstName: "Demo",
          lastName: "Admin",
          entityRoles: { create: { selfEntityId: entity.id, role: "ADMIN" } },
        },
      });
      console.log(`Created Admin: ${email} / Admin@12345`);
    }
  }

  // Vendors
  const vendorEmails = ["vendor1@gtp.com", "vendor2@gtp.com", "vendor3@gtp.com", "vendor4@gtp.com"];
  for (const email of vendorEmails) {
    const existing = await prisma.vendor.findUnique({ where: { email } });
    if (!existing) {
      await prisma.vendor.create({
        data: {
          selfEntityId: entity.id,
          legalName: "Vendor " + email.split("@")[0],
          vendorName: "Vendor " + email.split("@")[0],
          email: email,
          passwordHash: await hashPassword("Vendor@12345"),
          status: "ACTIVE",
          mobile: "+1-555-0000",
        },
      });
      console.log(`Created Vendor: ${email} / Vendor@12345`);
    }
  }

  // Consultants
  const consultantEmails = ["consultant1@gtp.com", "consultant2@gtp.com", "consultant3@gtp.com", "consultant4@gtp.com"];
  for (const email of consultantEmails) {
    const existing = await prisma.consultant.findUnique({ where: { email } });
    if (!existing) {
      await prisma.consultant.create({
        data: {
          selfEntityId: entity.id,
          fullName: "Consultant " + email.split("@")[0],
          email: email,
          passwordHash: await hashPassword("Consultant@12345"),
          status: "ACTIVE",
          mobileNumber: "+1-555-1111",
          visaStatus: "H1B",
        },
      });
      console.log(`Created Consultant: ${email} / Consultant@12345`);
    }
  }

  console.log("Seed complete! You can now test these dynamic logins.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
