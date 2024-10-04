"use client";
import Link from "next/link";
import "../globals.css";
//import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import React, { useState } from "react";

const Page1: React.FC = () => {
  const [folders, setFolders] = useState<{ name: string; image: string }[]>([
    { name: "BIOLOGY", image: "/path-to-biology-image.jpg" },
    { name: "HISTORY", image: "/path-to-history-image.jpg" },
  ]);
  const createNewFolder = () => {
    const folderName = prompt("Enter the name for the new subject folder:");
    const folderImage = prompt(
      "Enter the path for the image of the new subject folder (optional):"
    );
    if (folderName) {
      setFolders([
        ...folders,
        {
          name: folderName.toUpperCase(),
          image: folderImage || "/path-to-default-image.jpg",
        },
      ]);
    }
  };
  return (
    <div className="page-container">
      <header className="header">
        <div className="logo-container">
          <span className="logo-text">&quot;We are Learners&quot;</span>
        </div>
      </header>

      <div className="content-container">
        <div className="sidebar">
          <button className="sidebar-button">Student&apos;s folders</button>
          <button
            className="sidebar-button create-folder-button"
            onClick={createNewFolder}
          >
            Create folder
          </button>
        </div>
        <div className="folders-container">
          <h2>My Folders</h2>
          <div className="folders-grid">
            {folders.map((folder, index) => (
              <div
                key={index}
                className={`folder-card ${folder.name.toLowerCase()}`}
              >
                <div className="folder-title">{folder.name}</div>
                <Link href={"/chat"}>
                  <button className="view-button">View</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page1;
