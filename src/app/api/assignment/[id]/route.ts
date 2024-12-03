import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAssignment } from "./data";

const prisma = new PrismaClient();

// GET: Fetch a single assignment by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = getAssignment(params.id);

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
  const {
    title,
    subject,
    learningOutcomes,
    markingCriteria,
    additionalPrompt,
  } = body; // Include additionalPrompt

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
        additionalPrompt, // Update additionalPrompt
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
