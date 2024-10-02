"use client"; // Ensure this is at the top

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct hook for Next.js 13 "use client"

interface Assignment {
  id: number;
  learningOutcomes: string;
  markingCriteria: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    // Fetch the specific assignment by ID
    fetch(`/api/assignment/${params.id}`)
      .then((res) => res.json())
      .then((data) => setAssignment(data))
      .catch((err) => console.error("Error fetching assignment details", err));
  }, [params.id]);

  if (!assignment) {
    return <p>Loading assignment details...</p>;
  }

  return (
    <div className="assignment-detail">
      <h1>Assignment Details</h1>
      <p>
        <strong>Learning Outcomes:</strong> {assignment.learningOutcomes}
      </p>
      <p>
        <strong>Marking Criteria:</strong> {assignment.markingCriteria}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(assignment.createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Updated At:</strong>{" "}
        {new Date(assignment.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
