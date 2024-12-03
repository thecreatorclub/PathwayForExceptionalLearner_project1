import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAssignments() {
  return prisma.assignment.findMany({
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
