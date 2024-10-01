"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import "./globals.css";
// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import logo from "./logofromfigma.png";

const Page: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="page-container">
      <header className="header">
        <div className="logo-container">
          <Image
            src={logo}
            alt="Logo"
            className="logo"
            width={100}
            height={100}
          />
          <span className="logo-text">&quot;We are Learners&quot;</span>
        </div>
        {/* <div className="button-group">
          <ModeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton/>
          </SignedOut>
        </div> */}
      </header>
      <section className="intro-container">
        <h1 className="intro-page-head">Empower your assignment with AI</h1>
        <p className="intro-page-para-head">
          Our AI Assistant helps high school students excel in their studies by
          providing personalized feedback, expert advice, and secure document
          storage.
        </p>
        <Link href={"/chat"}>
          <button className="intro-page-button">Get Started</button>
        </Link>
      </section>
    </div>
  );
};

export default Page;
