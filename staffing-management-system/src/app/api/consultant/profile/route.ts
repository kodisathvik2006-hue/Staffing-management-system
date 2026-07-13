import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { jsonResponse } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const data = await request.json();

    const updatedProfile = await prisma.consultant.update({
      where: { id: session.sub },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        mobileNumber: data.mobileNumber,
        alternatePhone: data.alternatePhone,
        address: data.address,
        city: data.city,
        state: data.state,
        currentEmployer: data.currentEmployer,
        primarySkill: data.primarySkill,
        experience: data.experience,
        visaStatus: data.visaStatus,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
      },
    });

    return jsonResponse({ success: true, profile: updatedProfile }, 200);
  } catch (error: any) {
    console.error("Profile update error:", error);
    return jsonResponse({ error: "An error occurred during update" }, 500);
  }
}
