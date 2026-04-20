import prisma from "@/lib/prisma";

export async function findManyCitizenMessages() {
  return prisma.contactForm.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCitizenMessage(data: {
  type: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  dataset?: string | null;
}) {
  return prisma.contactForm.create({ data });
}

export async function updateCitizenMessageStatus(id: string, status: string) {
  return prisma.contactForm.update({
    where: { id },
    data: { status },
  });
}
