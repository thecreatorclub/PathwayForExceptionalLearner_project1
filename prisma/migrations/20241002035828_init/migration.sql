-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "learningOutcomes" TEXT NOT NULL,
    "markingCriteria" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);
