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
                  <strong>Learning Outcomes:</strong>{" "}
                  {assignment.learningOutcomes}
                </p>
                <p>
                  <strong>Marking Criteria:</strong>{" "}
                  {assignment.markingCriteria}
                </p>
                <div>
                  <Link
                    className="assignments-link"
                    href={`/admin/assignment/${assignment.id}`}
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* New Assignment Form */}
        <div className="assignment-form">
          <h3>Add New Assignment</h3>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Learning Outcomes:</label>
              <input
                type="text"
                value={learningOutcomes}
                onChange={(e) => setLearningOutcomes(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Marking Criteria:</label>
              <input
                type="text"
                value={markingCriteria}
                onChange={(e) => setMarkingCriteria(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Add Assignment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
