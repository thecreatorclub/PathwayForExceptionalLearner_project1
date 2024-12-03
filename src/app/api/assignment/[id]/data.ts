import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export function getAssignment(id: string) {
  return prisma.assignment.findFirst({
    where: { id: parseInt(id) },
    select: {
      id: true,
      title: true, // New field
      subject: true, // New field
      learningOutcomes: true,
      markingCriteria: true,
      additionalPrompt: true, // New field
      createdAt: true,
      updatedAt: true,
    },
  });
}
