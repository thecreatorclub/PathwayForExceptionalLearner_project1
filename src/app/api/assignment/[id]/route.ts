import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch a single assignment by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        title: true, // New field
        subject: true, // New field
        learningOutcomes: true,
        markingCriteria: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an assignment by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedAssignment = await prisma.assignment.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json(deletedAssignment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { title, subject, learningOutcomes, markingCriteria } = body;

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
    const updatedAssignment = await prisma.assignment.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        subject,
        learningOutcomes,
        markingCriteria,
      },
    });
    return NextResponse.json(updatedAssignment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
