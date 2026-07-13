import { requireAuth, errorResponse, jsonResponse } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    return jsonResponse({
      user: {
        id: session.sub,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        roles: session.roles,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
