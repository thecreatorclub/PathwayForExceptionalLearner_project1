"use client";
import { ModeToggle } from "@/components/dark-mode-toggle";
import '../globals.css';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import React, { useState } from 'react'; 
import logo from '../logofromfigma.png';
import Link from 'next/link';  // Import Link from next/link

const Page1: React.FC = () => {
  const [folders, setFolders] = useState<{ name: string; image: string; }[]>([
    { name: 'BIOLOGY', image: '/path-to-biology-image.jpg' },
    { name: 'HISTORY', image: '/path-to-history-image.jpg' },
  ]);
  const createNewFolder = () => {
    const folderName = prompt('Enter the name for the new subject folder:');
    const folderImage = prompt('Enter the path for the image of the new subject folder (optional):');
    if (folderName) {
      setFolders([...folders, { name: folderName.toUpperCase(), image: folderImage || '/path-to-default-image.jpg' }]);
    }
  };
  return (
    <div className="page-container">
      <header className="header">
        <div className="logo-container">
          <Image src={logo} alt="Logo" className="logo" width={100} height={100} />
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
      
      <div className="content-container">
        <div className="sidebar">
          <button className="sidebar-button">Student's folders</button>
          <button className="sidebar-button create-folder-button" onClick={createNewFolder}>Create folder</button>
        </div>
        <div className="folders-container">
          <h2>My Folders</h2>
          <div className="folders-grid">
        {folders.map((folder, index) => (
          <div key={index} className={`folder-card ${folder.name.toLowerCase()}`}>
            <img src={folder.image} alt={folder.name} className="folder-image" />
            <div className="folder-title">{folder.name}</div>
            <Link href={'/chat'}>
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