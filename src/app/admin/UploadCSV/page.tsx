"use client";

import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import "/src/app/globals.css";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import pLimit from "p-limit";
interface Student {
  studentID: number;
  question: string;
  response: string;
  feedback?: string;
}

const UploadCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [criteria, setCriteria] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [criteriaSubmitted, setCriteriaSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const markingCriteriaPanelRef = useRef<any>(null); // Ref for the panel

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // Handle form submission to upload and process CSV file

  const processBatchWithLimit = async (
    batch: any[][], // Array of rows, each row being an array of values
    limit: (fn: () => Promise<any>) => Promise<any> // Limit function from p-limit
  ): Promise<Student[]> => {
    const requests = batch.map((row: any[]) =>
      limit(async () => {
        const [studentID, question, response] = row; // Destructure the row
        
        try {
          console.log("Sending to API:", { row }); // Debug log
          const apiResponse = await fetch("/api/CSV", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentID: JSON.stringify(row[0]),
              question: JSON.stringify(row[1]),
              answer: JSON.stringify(row[2]),
              criteria,
            }),
          });

          if (apiResponse.ok) {
            const res = await apiResponse.json();
            return {
              studentID: parseInt(studentID), // Ensure correct type
              question,
              response,
              feedback: res.message,
            };
          } else {
            console.error(`Error processing question: ${question}`);
            return null;
          }
        } catch (error) {
          console.error(`Error for question: ${question}`, error);
          return null;
        }
      })
    );

    const results = await Promise.all(requests); // Resolve all requests
    return results.filter((result): result is Student => result !== null); // Filter non-null results
  };

  const handleSubmit = async () => {
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async (e) => {
        const text = e.target?.result as string;

        Papa.parse(text, {
          header: false,
          skipEmptyLines: true,
          complete: async (results) => {
            const parsedData: any[][] = results.data.slice(1) as any[][]; // Skip header
            const batchSize = 10; // Number of rows per batch
            const limit = pLimit(5); // Limit 5 concurrent requests

            const batches: any[][][] = [];
            for (let i = 0; i < parsedData.length; i += batchSize) {
              batches.push(parsedData.slice(i, i + batchSize));
            }

            let allResults: Student[] = []; // Initialize as an empty array
            for (const batch of batches) {
              const batchResults = await processBatchWithLimit(batch, limit);
              allResults = [...allResults, ...batchResults]; // Append results
            }

            setStudents(allResults); // Set students in state
            setCriteriaSubmitted(true);
            setLoading(false);
          },
        });
      };
    }
  };

  // Collapse the Marking Criteria panel when criteria is submitted
  useEffect(() => {
    if (criteriaSubmitted && markingCriteriaPanelRef.current) {
      markingCriteriaPanelRef.current.collapse();
    }
  }, [criteriaSubmitted]);

  // Group students by their studentID for easy rendering
  const groupedStudents = students.reduce((acc, student) => {
    // If the studentID does not exist in the accumulator, create an empty array for it
    if (!acc[student.studentID]) {
      acc[student.studentID] = [];
    }
    // Add the student to the corresponding studentID group
    acc[student.studentID].push(student);
    return acc;
  }, {} as { [key: number]: Student[] });

  // Render feedback for each student
  const renderStudentFeedback = () => {
    return Object.entries(groupedStudents).map(
      ([studentID, studentRecords]) => (
        <div key={studentID} className="mb-4">
          <h3 className="text-lg font-semibold">Student ID: {studentID}</h3>
          {studentRecords.map((student, index) => (
            <div key={index} className="ml-4 mb-2">
              <p>
                <strong>Feedback for Question {index + 1}:</strong>{" "}
                {student.feedback}
              </p>
            </div>
          ))}
        </div>
      )
    );
  };

  return (
    <div className=" mx-auto h-full w-full ">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50}>
          <PanelGroup direction="vertical">
            {/* Questions Section - Top Left */}
            <Panel defaultSize={25}>
              <div className="border p-4 shadow-md rounded-md flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-4">Questions</h2>
                <div className="flex-1 overflow-auto">
                  {students.length > 0 ? (
                    // Extract unique questions and render them
                    Array.from(
                      new Set(students.map((student) => student.question))
                    ).map((question, index) => (
                      <div key={index} className="mb-4">
                        <p>
                          <strong>Question {index + 1}:</strong> {question}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No questions available. Please upload a CSV file.</p>
                  )}
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="h-2 bg-gray-200 cursor-row-resize" />
            {/* Student Answers Section - Bottom Left */}
            <Panel defaultSize={50}>
              <div className="border p-4 shadow-md rounded-md flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-4">Student Answers</h2>
                <div className="flex-1 overflow-auto">
                  {Object.entries(groupedStudents).map(
                    ([studentID, studentRecords]) => (
                      <div key={studentID} className="mb-4">
                        <h3 className="text-lg font-semibold">
                          Student ID: {studentID}
                        </h3>
                        {studentRecords.map((student, index) => (
                          <div key={index} className="ml-4 mb-2">
                            <p>
                              <strong>Answer {index + 1}:</strong>{" "}
                              {student.response}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="w-2 bg-gray-200 cursor-col-resize" />
        <Panel defaultSize={50}>
          <PanelGroup direction="vertical">
            {/* Marking Criteria Section - Top Right */}
            <Panel
              defaultSize={50}
              order={1}
              minSize={10}
              collapsible
              ref={markingCriteriaPanelRef}
            >
              <div className="border p-4 shadow-md rounded-md flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-4 ">
                  Marking Criteria
                </h2>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="file-input mb-4 shadow-md"
                />
                <textarea
                  name="Marking Criteria"
                  placeholder="Enter Criteria"
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  className="textarea textarea-bordered w-full h-40 mb-4 flex-1"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-success mt-2 self-start"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </Panel>
            <PanelResizeHandle className="h-2 bg-gray-200 cursor-row-resize" />
            {/* Feedback Section - Bottom Right */}
            <Panel collapsible order={2} defaultSize={50}>
              <div className="border p-4 shadow-md rounded-md flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-4">Feedback</h2>
                <div className="flex-1 overflow-auto">
                  {students.length > 0 ? (
                    renderStudentFeedback()
                  ) : (
                    <p>
                      No feedback available. Please upload and submit a CSV
                      file.
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default UploadCSV;
