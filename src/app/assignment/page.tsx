"use client";

import { useState, useEffect } from "react";

interface Assignment {
  id: number;
  learningOutcomes: string;
  markingCriteria: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [markingCriteria, setMarkingCriteria] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // Fetch all assignments
  useEffect(() => {
    fetch("/api/assignment")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error("Error fetching assignments", err));
  }, []);

  // Add or update an assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/assignment/${editId}` : "/api/assignment";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ learningOutcomes, markingCriteria }),
    });

    if (response.ok) {
      const newAssignment = await response.json();
      if (editId) {
        setAssignments((prev) =>
          prev.map((a) => (a.id === editId ? newAssignment : a))
        );
        setEditId(null); // Reset edit state
      } else {
        setAssignments([...assignments, newAssignment]); // Add new
      }
      setLearningOutcomes("");
      setMarkingCriteria("");
    } else {
      console.error("Failed to submit assignment");
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/assignment/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== id)
      );
    } else {
      console.error("Failed to delete assignment");
    }
  };

  // Handle edit
  const handleEdit = (assignment: Assignment) => {
    setEditId(assignment.id);
    setLearningOutcomes(assignment.learningOutcomes);
    setMarkingCriteria(assignment.markingCriteria);
  };

  return (
    <div className="assignment-page">
      <div className="assignment-container">
        <div className="assignment-form">
          <h1>Add / Edit Assignment</h1>
          <form onSubmit={handleSubmit}>
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
              {editId ? "Update" : "Add"} Assignment
            </button>
          </form>
        </div>

        <div className="assignment-list">
          <h2>Assignment List</h2>
          <ul>
            {assignments.map((assignment) => (
              <li key={assignment.id} className="assignment-item">
                <p>
                  <strong>Learning Outcomes:</strong>{" "}
                  {assignment.learningOutcomes}
                </p>
                <p>
                  <strong>Marking Criteria:</strong>{" "}
                  {assignment.markingCriteria}
                </p>
                <button onClick={() => handleEdit(assignment)}>Edit</button>
                <button onClick={() => handleDelete(assignment.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
