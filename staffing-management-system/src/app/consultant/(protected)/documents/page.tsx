import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DocumentsClient from "./documents-client";

export default async function ConsultantDocuments() {
  const session = await getSession();
  if (!session || !session.roles.some((r) => r.role === "CONSULTANT")) {
    redirect("/consultant/login");
  }

  const documents = await prisma.consultantDocument.findMany({
    where: { consultantId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return <DocumentsClient initialDocuments={documents} />;
}
