"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SelectMenu from '@/components/select-menu/selectmenu';
import { SubjectOptions, Biology, History, SubjectOption } from '@/components/select-menu/data';
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import { ModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  learningOutcomes: string;
  markingCriteria: string;
  additionalPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [markingCriteria, setMarkingCriteria] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption | null>(null);

  // Fetch all assignments
  useEffect(() => {
    fetch("/api/assignment")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error("Error fetching assignments", err));
  }, []);

  // Process template tags into full template texts
  const processTemplateText = (text: string) => {
    const templateMap: { [key: string]: string } = {
      'biology-prompt': Biology,
      'history-prompt': History,
      // Add more templates as needed
    };

    // Replace mentions with actual template content
    return text.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (match, display, id) => {
      return templateMap[id] || match;
    });
  };

  // Handle subject change
  const handleSubjectChange = (selectedOption: SubjectOption | null) => {
    // Check if current subject is 'Custom' and user is changing to a different subject
    if (
      subject === 'Custom' &&
      selectedOption &&
      selectedOption.value !== 'Custom'
    ) {
      const confirmChange = window.confirm(
        'Changing the subject will reset your additional prompt. Do you want to proceed?'
      );

      if (!confirmChange) {
        // User canceled, do not update the subject
        return;
      } else {
        // Reset the additionalPrompt
        setAdditionalPrompt('');
      }
    }

    setSelectedSubject(selectedOption);
    setSubject(selectedOption ? selectedOption.value : '');

    if (selectedOption) {
      if (selectedOption.value === 'Biology') {
        // Set the Additional Prompt to the mention tag for Biology
        setAdditionalPrompt(`@[biology-prompt](biology-prompt)`);
      } else if (selectedOption.value === 'History') {
        // Set the Additional Prompt to the mention tag for History
        setAdditionalPrompt(`@[history-prompt](history-prompt)`);
      } else if (selectedOption.value === 'Custom') {
        setAdditionalPrompt(''); // Leave empty for custom input
      }
    } else {
      setAdditionalPrompt('');
    }
  };

  // Handle form submission to add or edit an assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !subject || !learningOutcomes || !markingCriteria) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    // Show a warning if using Custom subject with mention tags
    if (
      selectedSubject?.value === 'Custom' &&
      /@\[([^\]]+)\]\(([^)]+)\)/g.test(additionalPrompt)
    ) {
      alert('Using custom prompt with tags might create issues.');
    }

    if (selectedSubject?.value === 'Biology' && additionalPrompt.trim() !== '@[biology-prompt](biology-prompt)') {
      alert('For Biology subject, the Additional Prompt should contain only the biology-prompt tag.');
      return;
    }

    if (selectedSubject?.value === 'History' && additionalPrompt.trim() !== '@[history-prompt](history-prompt)') {
      alert('For History subject, the Additional Prompt should contain only the history-prompt tag.');
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
          additionalPrompt, // Save the additionalPrompt as-is
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

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setLearningOutcomes("");
    setMarkingCriteria("");
    setAdditionalPrompt("");
    setEditingAssignmentId(null);
    setErrorMessage(null);
    setShowForm(false);
    setSelectedSubject(null);
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

    const selectedOption = SubjectOptions.find(option => option.value === assignment.subject);
    setSelectedSubject(selectedOption || null);
  };

  // Handle add action
  const handleAdd = () => {
    resetForm();
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

  // Mention data
  const mentionData: SuggestionDataItem[] = [
    { id: 'biology-prompt', display: 'biology-prompt' },
    { id: 'history-prompt', display: 'history-prompt' },
    // Add more mention tags as needed
  ];

  // Custom render function for the mentions
  const renderMentions = (text: string) => {
    const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      if (start > lastIndex) {
        parts.push(text.substring(lastIndex, start));
      }
      parts.push(
        <span key={start} className="mentions__mention">
          {match[1]}
        </span>
      );
      lastIndex = end;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  };

  return (
    <div className="assignment-page">
      <div className="assignment-container">
        {!showForm ? (
          <div className="assignment-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/">
              <h1 style={{ cursor: "pointer" }}>Home</h1>
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
                  <p>
                    <strong>Additional Prompt:</strong>
                  </p>
                  <div className="mentions read-only">
                    {renderMentions(assignment.additionalPrompt)}
                  </div>
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
                <label>Subject:</label>
                <SelectMenu onChange={handleSubjectChange} value={selectedSubject} />
              </div>
              <div className="form-group">
                <label>Additional Prompt:</label>
                {selectedSubject?.value === 'Custom' ? (
                  <MentionsInput
                    value={additionalPrompt}
                    onChange={(event, newValue) => setAdditionalPrompt(newValue)}
                    placeholder="Type '@' to select a prompt..."
                    className="mentions"
                    allowSuggestionsAboveCursor={true}
                    style={{ height: '200px' }}
                    singleLine={false}
                  >
                    <Mention
                      trigger="@"
                      data={mentionData}
                      markup="@[$__display__]($__id__)"
                      appendSpaceOnAdd={true}
                      renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
                        <div className={`suggestion-item ${focused ? 'focused' : ''}`}>
                          {highlightedDisplay}
                        </div>
                      )}
                    />
                  </MentionsInput>
                ) : (
                  <div className="mentions read-only">
                    {renderMentions(additionalPrompt)}
                  </div>
                )}
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
