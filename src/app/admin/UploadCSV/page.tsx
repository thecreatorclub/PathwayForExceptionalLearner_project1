"use client";

import React, { useState } from "react";

const UploadCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [line, setLine] = useState("");
  const [criteria, setCriteria] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log(criteria, line);
      const response = await fetch("/api/CSV", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line,
          criteria,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        const text = e.target?.result as string;
        console.log(text);

        // Store the entire CSV content as a string
        setLine(text);
      };
    }
  };

  return (
    <div>
      <h1>Upload CSV File</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <h1>Marking Criteria</h1>
          <textarea
            name="Marking Criteria"
            placeholder="Enter Criteria"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default UploadCSV;
