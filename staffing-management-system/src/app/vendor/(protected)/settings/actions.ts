"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { revalidatePath } from "next/cache";

export async function updateVendorSettings(data: {
  legalName: string;
  mobile: string;
  website: string;
  taxId: string;
  address: string;
}) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "VENDOR") || !session.vendorId) {
      return { error: "Unauthorized" };
    }

    await prisma.vendor.update({
      where: { id: session.vendorId },
      data: {
        legalName: data.legalName,
        mobile: data.mobile,
        website: data.website,
        taxId: data.taxId,
        registeredAddress: data.address,
      },
    });

    revalidatePath("/vendor/settings");
    revalidatePath("/vendor/profile");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update vendor settings:", error);
    return { error: error.message || "Failed to update settings" };
  }
}
