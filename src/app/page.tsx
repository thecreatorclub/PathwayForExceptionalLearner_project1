"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './globals.css'; // Import the CSS file

const Page = () => {
  const [learningOutcome, setLearningOutcome] = useState('');
  const [markingCriteria, setMarkingCriteria] = useState('');
  const [studentWriting, setStudentWriting] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setFeedback('');
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learningOutcome,
        markingCriteria,
        studentWriting,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setFeedback(data.message || 'No feedback received.');
    } else {
      setFeedback('Error: Unable to get feedback.');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <h2>Learning Outcome</h2>
          <textarea
            value={learningOutcome}
            onChange={(e) => setLearningOutcome(e.target.value)}
            rows="10"
          />
        </div>

        <div className="column">
          <h2>Marking Criteria</h2>
          <textarea
            value={markingCriteria}
            onChange={(e) => setMarkingCriteria(e.target.value)}
            rows="10"
          />
        </div>

        <div className="column">
          <h2>Student Writing</h2>
          <textarea
            value={studentWriting}
            onChange={(e) => setStudentWriting(e.target.value)}
            rows="10"
          />
        </div>
      </div>

      <div className="button-container">
        <button onClick={handleSubmit}>Get Feedback</button>
      </div>

      <div className="markdown-body">
        {loading && <div className="loading">Generating feedback...</div>}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Page;
