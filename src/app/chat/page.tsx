"use client";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import remarkGfm from 'remark-gfm';
import '../globals.css'; // Import the CSS file
import logo from '../logofromfigma.png';
import Link from 'next/link'; 
import SideNavBar from '@/components/sidebar/sidenav';

const Page2 = () => {
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
    <div className="page-container">
      <header className="header">
        <div className="logo-container">
          <Link href={'chat'}>
            <Image src={logo} alt="Logo" className="logo" width={100} height={100} />
          </Link>
          <span className="logo-text">"We are Learners"</span>
        </div>
        <div className="button-group">
          <ModeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton/>
          </SignedOut>
        </div>
      </header>
      <main>
        <SideNavBar />
        <div className="column-container">
          <div className="left-column left-markdown-body">
            <h2>Learning Outcome</h2>
            <textarea
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              rows="10"
            />
            <h2>Marking Criteria</h2>
            <textarea
              value={markingCriteria}
              onChange={(e) => setMarkingCriteria(e.target.value)}
              rows="10"
            />
          </div>
          <div className="vertical-line"></div>
          <div className="right-column">
            <h2>Student Writing</h2>
            <textarea
              value={studentWriting}
              onChange={(e) => setStudentWriting(e.target.value)}
              rows="20"
            />
            <div className="button-container">
              <button onClick={handleSubmit}>Get Feedback</button>
            </div>
            <div className="markdown-body">
              {loading && <div className="loading">Generating feedback...</div>}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page2;
