import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Create a new assignment
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { learningOutcomes, markingCriteria } = body;

  try {
    const newAssignment = await prisma.assignment.create({
      data: {
        learningOutcomes,
        markingCriteria,
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
    const assignments = await prisma.assignment.findMany();
    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
