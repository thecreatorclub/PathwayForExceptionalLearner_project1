import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Create a new assignment
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subject, learningOutcomes, markingCriteria, additionalPrompt } = body; // New fields: title, subject

  if (!title || !subject || !learningOutcomes || !markingCriteria) {
    return NextResponse.json(
      {
        error:
          "Please provide all required fields: title, subject, learningOutcomes, markingCriteria",
      },
      { status: 400 }
    );
  }

  try {
    const newAssignment = await prisma.assignment.create({
      data: {
        title, // New field
        subject, // New field
        learningOutcomes,
        markingCriteria,
        additionalPrompt,
      },
    });
    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

// GET: Retrieve all assignments
export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
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
    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
