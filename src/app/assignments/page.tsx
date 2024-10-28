"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  learningOutcomes: string;
  markingCriteria: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [markingCriteria, setMarkingCriteria] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all assignments
  useEffect(() => {
    fetch("/api/assignment")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error("Error fetching assignments", err));
  }, []);

  // Handle form submission to add a new assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !subject || !learningOutcomes || !markingCriteria) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subject,
          learningOutcomes,
          markingCriteria,
        }),
      });

      if (response.ok) {
        const newAssignment = await response.json();
        // Append the new assignment to the state
        setAssignments([...assignments, newAssignment]);
        setTitle("");
        setSubject("");
        setLearningOutcomes("");
        setMarkingCriteria("");
        setErrorMessage(null);
        setSuccessMessage("Assignment added successfully!");
      } else {
        setErrorMessage("Failed to add assignment");
      }
    } catch (error) {
      setErrorMessage("An error occurred while adding the assignment");
    }
  };

  // Handle delete action
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/assignment/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAssignments(
          assignments.filter((assignment) => assignment.id !== id)
        );
        setSuccessMessage("Assignment deleted successfully!");
      } else {
        setErrorMessage("Failed to delete assignment");
      }
    } catch (error) {
      setErrorMessage("An error occurred while deleting the assignment");
    }
  };

  return (
    <div className="assignment-page">
      <div className="assignment-container">
        <div className="assignment-list">
          <Link href="/">
            <h1 style={{ cursor: "pointer" }}>Home</h1>
          </Link>
          <h2>Assignment List</h2>
          <ul>
            {assignments.map((assignment) => (
              <li key={assignment.id} className="assignment-item">
                <p>
                  <strong>Title:</strong> {assignment.title}
                </p>
                <p>
                  <strong>Subject:</strong> {assignment.subject}
                </p>
                <p>
                  <strong>Learning Outcomes:</strong>
                </p>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {assignment.learningOutcomes}
                </pre>
                <p>
                  <strong>Marking Criteria:</strong>
                </p>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {assignment.markingCriteria}
                </pre>
                <div>
                  <Link
                    className="assignments-link"
                    href={`/assignment/${assignment.id}`}
                  >
                    View Details
                  </Link>
                </div>
                <div>
                  <Link
                    className="assignments-link"
                    href={`/chat?assignmentId=${assignment.id}&readonly=true`}
                  >
                    Chat
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
