"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import "./globals.css";
import logo from "./logofromfigma.png";

const Page: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    setIsClient(true);

    const storedOption = sessionStorage.getItem("userRole");
    if (storedOption) {
      setSelectedOption(storedOption); // Restore the selection from sessionStorage
    }
  }, []);

  if (!isClient) {
    return null;
  }

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const option = e.target.value;
    setSelectedOption(option);
    sessionStorage.setItem("userRole", option); // Store selection in sessionStorage
  };

  // Conditional link routing based on user type
  const getRedirectUrl = () => {
    if (selectedOption === "Teachers") {
      return "/assignment"; // Redirect to the assignment editing page for teachers
    } else if (selectedOption === "Students") {
      return "/chat"; // Redirect to the chat page for students
    }
    return "#"; // Default URL if no option is selected
  };

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
          <span className="logo-text">&quot;We are Learners!!&quot;</span>
        </div>
      </header>
      <section className="intro-container">
        <h1 className="intro-page-head">Empower your assignment with AI</h1>
        <p className="intro-page-para-head">
          Our AI Assistant helps high school students excel in their studies by
          providing personalized feedback, expert advice, and secure document
          storage.
        </p>

        {/* Radio Button Implementation */}
        <form className="radio-container">
          <label className="radio-label">
            <input
              type="radio"
              value="Students"
              checked={selectedOption === "Students"}
              onChange={handleOptionChange}
            />
            Student
          </label>

          <label className="radio-label">
            <input
              type="radio"
              value="Teachers"
              checked={selectedOption === "Teachers"}
              onChange={handleOptionChange}
            />
            Teacher
          </label>
        </form>

        {/* Conditional rendering based on selected option */}
        {selectedOption && (
          <Link href={getRedirectUrl()}>
            <button className="intro-page-button">
              Proceed to {selectedOption}
            </button>
          </Link>
        )}
      </section>
    </div>
  );
};

export default Page;
