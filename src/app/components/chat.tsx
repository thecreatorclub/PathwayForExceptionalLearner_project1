import React, { useState } from 'react';

const ChatComponent = () => {
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    const assignmentContent = document.getElementById('assignmentContent')?.innerHTML;
    const learningOutcomeContent = document.getElementById('learningOutcomeContent')?.innerHTML;
    const markingCriteriaContent = document.getElementById('markingCriteriaContent')?.innerHTML;
    const input = (document.getElementById('inputField') as HTMLInputElement)?.value; // Ensure this value is set correctly

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentContent,
          learningOutcomeContent,
          markingCriteriaContent,
          input,
        }),
      });

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div id="assignmentContent">Assignment content here...</div>
      <div id="learningOutcomeContent">Learning outcome content here...</div>
      <div id="markingCriteriaContent">Marking criteria content here...</div>
      <textarea id="inputField" placeholder="Enter your input here"></textarea>
      <button onClick={handleSubmit}>Submit</button>
      {response && (
        <div>
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
