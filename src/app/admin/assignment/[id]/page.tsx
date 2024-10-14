"use client"; // Ensure this is at the top

import { useState, useEffect } from "react";
import Link from "next/link"; // Import Link

interface Assignment {
  id: number;
  title: string; // New field for title
  subject: string; // New field for subject
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
  const [feedback, setFeedback] = useState<string>("");

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

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleGenerateFeedback = () => {
    // Dummy function for "Generate Feedback" button
    console.log("Generating feedback for:", feedback);
  };

  return (
    <div>
      <Link href="/">
        <h1 style={{ cursor: "pointer" }}>Home</h1>
      </Link>
      <div className="assignment-page">
        <div className="assignment-container">
          {/* Left Part: Display Title, Subject, Learning Outcomes & Marking Criteria */}
          <div className="left-column">
            <h1>Assignment List</h1>
            <h2>Title</h2>
            <p>{assignment.title}</p> {/* New field */}
            <h2>Subject</h2>
            <p>{assignment.subject}</p> {/* New field */}
            <h2>Learning Outcomes</h2>
            <pre className="assignment-item-button">
              {assignment.learningOutcomes}
            </pre>
            <h2>Marking Criteria</h2>
            <pre className="assignment-item-button">
              <p>{assignment.markingCriteria}</p>
            </pre>
          </div>

          {/* Right Part: Textbox and Generate Feedback Button */}
          <div className="right-column">
            <textarea
              id="student-writing"
              placeholder="Paste your text here..."
              value={feedback}
              onChange={handleFeedbackChange}
            ></textarea>

            <div className="button-container">
              <button
                className="submit-button"
                onClick={handleGenerateFeedback}
              >
                Generate Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
