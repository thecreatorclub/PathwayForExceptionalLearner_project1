"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  learningOutcomes: string;
  markingCriteria: string;
  additionalPrompt: string; // Added this line
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [markingCriteria, setMarkingCriteria] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState(""); // New state for additional prompt
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  // Fetch all assignments
  useEffect(() => {
    fetch("/api/assignment")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error("Error fetching assignments", err));
  }, []);

  // Handle form submission to add or edit an assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !subject || !learningOutcomes || !markingCriteria) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    try {
      const url = editingAssignmentId
        ? `/api/assignment/${editingAssignmentId}`
        : "/api/assignment";
      const method = editingAssignmentId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subject,
          learningOutcomes,
          markingCriteria,
          additionalPrompt,
        }),
      });

      if (response.ok) {
        const savedAssignment = await response.json();
        if (editingAssignmentId) {
          setAssignments(
            assignments.map((assignment) =>
              assignment.id === editingAssignmentId
                ? savedAssignment
                : assignment
            )
          );
          setSuccessMessage("Assignment updated successfully!");
        } else {
          setAssignments([...assignments, savedAssignment]);
          setSuccessMessage("Assignment added successfully!");
        }
        resetForm();
      } else {
        setErrorMessage("Failed to save assignment");
      }
    } catch (error) {
      setErrorMessage("An error occurred while saving the assignment");
    }
  };

  // Reset form fields and editing state
  const resetForm = () => {
    setTitle("");
    setSubject("");
    setLearningOutcomes("");
    setMarkingCriteria("");
    setAdditionalPrompt(""); // Reset additionalPrompt
    setEditingAssignmentId(null);
    setErrorMessage(null);
    setShowForm(false); // Hide the form and show the list again
  };

  // Handle edit action
  const handleEdit = (assignment: Assignment) => {
    setTitle(assignment.title);
    setSubject(assignment.subject);
    setLearningOutcomes(assignment.learningOutcomes);
    setMarkingCriteria(assignment.markingCriteria);
    setAdditionalPrompt(assignment.additionalPrompt);
    setEditingAssignmentId(assignment.id);
    setShowForm(true);
  };
  

  // Handle add action
  const handleAdd = () => {
    resetForm(); // Clear the form for adding a new assignment
    setShowForm(true);
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
        {/* Conditionally render Assignment List or Form based on showForm state */}
        {!showForm ? (
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
                  <p>
                    <strong>Additional Prompt:</strong>
                  </p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {assignment.additionalPrompt}
                  </pre>
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                  <div>
                    <Link
                      className="assignments-link"
                      href={`/admin/assignment/${assignment.id}`}
                    >
                      View Details
                    </Link>
                  </div>
                  <div>
                    <Link
                      className="assignments-link"
                      href={`/chat?assignmentId=${assignment.id}&readonly=false`}
                    >
                      Chat
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={handleAdd} className="add-button">
              Add New Assignment
            </button>
          </div>
        ) : (
          <div className="assignment-form">
            <h3>
              {editingAssignmentId ? "Edit Assignment" : "Add New Assignment"}
            </h3>
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
                <textarea
                  value={learningOutcomes}
                  onChange={(e) => setLearningOutcomes(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Marking Criteria:</label>
                <textarea
                  value={markingCriteria}
                  onChange={(e) => setMarkingCriteria(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Additional Prompt:</label>
                <textarea
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  rows={4}
                  placeholder="Enter additional prompt here..."
                />
              </div>
              <button type="submit">
                {editingAssignmentId ? "Save" : "Add Assignment"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="cancel-button"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
