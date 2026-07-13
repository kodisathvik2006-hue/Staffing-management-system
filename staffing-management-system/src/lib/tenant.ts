import { getSession } from "@/lib/jwt";

export async function getTenantIdFromSession(): Promise<string | undefined> {
  const session = await getSession();
  return session?.roles[0]?.selfEntityId;
}
