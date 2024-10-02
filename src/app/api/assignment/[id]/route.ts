import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

// PUT: Update an assignment by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { learningOutcomes, markingCriteria } = body;

  try {
    const updatedAssignment = await prisma.assignment.update({
      where: { id: parseInt(params.id) },
      data: { learningOutcomes, markingCriteria },
    });
    return NextResponse.json(updatedAssignment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
