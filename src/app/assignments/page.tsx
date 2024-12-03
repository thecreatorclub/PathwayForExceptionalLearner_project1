import { ModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { getAssignments } from "../api/assignment/route";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  learningOutcomes: string;
  markingCriteria: string;
  createdAt: string;
  updatedAt: string;
}

export default async function AssignmentListPage() {
  // Fetch all assignments
  const assignments = await getAssignments();

  return (
    <div className="assignment-page">
      <div className="assignment-container">
        <div className="assignment-list">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Link href="/">
              <h1 className=" text-xl" style={{ cursor: "pointer" }}>
                Home
              </h1>
            </Link>
            <ThemeProvider>
              <ModeToggle />
            </ThemeProvider>
          </div>
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
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
