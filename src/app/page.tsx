"use client";
import { Button, Heading, Radio } from "@radix-ui/themes";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import "./main.css";

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
      return "admin/assignments"; // Redirect to the assignment editing page for teachers
    } else if (selectedOption === "Students") {
      return "/assignments"; // Redirect to the chat page for students
    }
    return "#"; // Default URL if no option is selected
  };

  return (
    <div className="h-full flex justify-center items-center">
      <section className="max-w-3xl flex flex-col gap-2 items-center">
        <Heading as="h1">Empower your assignment with AI</Heading>
        <p className="text-center">
          Our AI Assistant helps high school students excel in their studies by
          providing personalized feedback, expert advice, and secure document
          storage.
        </p>

        {/* Radio Button Implementation */}
        <form className="py-4">
          <label
            htmlFor="students"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Radio
              id="students"
              value="Students"
              checked={selectedOption === "Students"}
              onChange={handleOptionChange}
            />
            Student
          </label>

          <label
            htmlFor="teachers"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Radio
              id="teachers"
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
            <Button className="cursor-pointer">
              Proceed to {selectedOption}
            </Button>
          </Link>
        )}
      </section>
    </div>
  );
};

export default Page;
