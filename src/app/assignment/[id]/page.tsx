"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./../../globals.css";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  PanelResizeHandle,
  Panel,
  PanelGroup,
} from "react-resizable-panels";
import { Node, Path, Text, Descendant } from "slate";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import SlateEditor from "./SlateEditor";
import Improvements from "./Improvements";
import { EventEmitter } from "./EventEmitter";
import { escapeRegExp } from "./utils";
import { renderMentions } from "../../../utils/renderMentions";

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

export default function AssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  // State and refs
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [learningOutcome, setLearningOutcome] = useState("");
  const [markingCriteria, setMarkingCriteria] = useState("");
  const [editorValue, setEditorValue] = useState<Descendant[]>([
    {
      children: [{ text: "" }],
    },
  ]);
  const [feedback, setFeedback] = useState("");
  const [displayedFeedback, setDisplayedFeedback] = useState("");
  const feedbackIndexRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [errorList, setErrorList] = useState<
    Array<{
      id: string;
      originalText: string;
      improvementText: string;
      path: Path;
      offsetTop?: number;
      height?: number; // Store the height of the corresponding text block
    }>
  >([]);
  const hoveredErrorIdRef = useRef<string | null>(null);
  const [errorsUpdated, setErrorsUpdated] = useState(false);
  const slateEditorRef = useRef<any>(null);
  const improvementsRef = useRef<any>(null);
  const isSyncingScroll = useRef(false);
  const hoverEventEmitter = useMemo(() => new EventEmitter(), []);

  const [editorContentHeight, setEditorContentHeight] = useState<number>(0);

  // Hooks
  useEffect(() => {
    const savedPrompt = localStorage.getItem("additionalPrompt");
    if (savedPrompt) {
      setAdditionalPrompt(savedPrompt);
    }
  }, []);

  useEffect(() => {
    fetch(`/api/assignment/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setAssignment(data);
        setLearningOutcome(data.learningOutcomes);
        setMarkingCriteria(data.markingCriteria);
        setAdditionalPrompt(data.additionalPrompt);
      });
  }, [params.id]);

  useEffect(() => {
    if (!feedback) {
      setDisplayedFeedback("");
      feedbackIndexRef.current = 0;
      return;
    }

    setDisplayedFeedback("");
    feedbackIndexRef.current = 0;

    const typeWriter = () => {
      setDisplayedFeedback(feedback.slice(0, feedbackIndexRef.current + 1));
      feedbackIndexRef.current += 1;

      if (feedbackIndexRef.current < feedback.length) {
        timeoutRef.current = setTimeout(typeWriter, 10);
      }
    };

    timeoutRef.current = setTimeout(typeWriter, 10);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [feedback]);

  // Functions
  const updateErrorPositions = (
    positions: { [errorId: string]: { offsetTop: number; height: number } }
  ) => {
    setErrorList((prevErrorList) =>
      prevErrorList.map((error) => ({
        ...error,
        offsetTop: positions[error.id]?.offsetTop,
        height: positions[error.id]?.height,
      }))
    );
  };

  const syncScrollPositions = useCallback(() => {
    const editorContainer = slateEditorRef.current?.getContainer();
    const improvementsContainer = improvementsRef.current?.getContainer();

    if (!editorContainer || !improvementsContainer) return;

    const onEditorScroll = () => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;

      improvementsContainer.scrollTop = editorContainer.scrollTop;

      isSyncingScroll.current = false;
    };

    const onImprovementsScroll = () => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;

      editorContainer.scrollTop = improvementsContainer.scrollTop;

      isSyncingScroll.current = false;
    };

    editorContainer.addEventListener("scroll", onEditorScroll);
    improvementsContainer.addEventListener("scroll", onImprovementsScroll);

    return () => {
      editorContainer.removeEventListener("scroll", onEditorScroll);
      improvementsContainer.removeEventListener(
        "scroll",
        onImprovementsScroll
      );
    };
  }, []);

  useEffect(() => {
    const cleanup = syncScrollPositions();
    return () => {
      if (cleanup) cleanup();
    };
  }, [syncScrollPositions]);

  // Event handlers
  async function handleSubmit() {
    if (
      slateEditorRef.current &&
      typeof slateEditorRef.current.scrollToTop === "function"
    ) {
      slateEditorRef.current.scrollToTop();
    }

    setLoading(true);
    setFeedback("");
    setDisplayedFeedback("");
    feedbackIndexRef.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      const studentWritingText = editorValue
        .map((line) => Node.string(line))
        .join("\n");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningOutcome,
          markingCriteria,
          studentWriting: studentWritingText,
          additionalPrompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        extractFeedback(data.message || "No feedback received.");

        const feedbackCleaned = data.message
          .replace(
            /\*\*Original Text:\*\*\s*"([^"]+)"\s*<endoforiginal>/gi,
            ""
          )
          .replace(/\*\*Improvement:\*\*\s*[\s\S]*?<endofimprovement>/g, "");
        setFeedback(feedbackCleaned.trim());

        syncScrollPositions();
      } else {
        setFeedback("Error: Unable to get feedback.");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedback("Error: Unable to get feedback.");
    } finally {
      setLoading(false);
    }
  }

  function extractFeedback(feedback: string) {
    const originalTextRegex =
      /\*\*Original Text:\*\*\s*"([^"]+)"\s*<endoforiginal>/gi;
    const improvementRegex =
      /\*\*Improvement:\*\*\s*([\s\S]*?)<endofimprovement>/g;

    const replacements = [];

    let matchOriginal;
    let matchImprovement;

    while (
      (matchOriginal = originalTextRegex.exec(feedback)) !== null &&
      (matchImprovement = improvementRegex.exec(feedback)) !== null
    ) {
      const originalText = matchOriginal[1];
      const improvementText = matchImprovement[1].trim();
      replacements.push({ originalText, improvementText });
    }

    console.log("Replacements extracted:", replacements);

    processStudentWriting(editorValue, replacements);
  }

  function processStudentWriting(
    editorValue: Descendant[],
    replacements: { originalText: string; improvementText: string }[]
  ) {
    let errors: Array<{
      id: string;
      originalText: string;
      improvementText: string;
      path: Path;
      offsetTop?: number;
      height?: number;
    }> = [];

    for (const [node, path] of Node.nodes({ children: editorValue })) {
      if (Text.isText(node)) {
        const text = node.text;
        replacements.forEach(
          ({ originalText, improvementText }, errorIndex) => {
            const regex = new RegExp(escapeRegExp(originalText), "gi");
            let match;
            let occurrenceIndex = 0;

            while ((match = regex.exec(text)) !== null) {
              const errorId = `${Path.toString()}-${path.join(
                "."
              )}-${errorIndex}-${occurrenceIndex}`;
              console.log("Found match:", {
                errorId,
                originalText,
                path,
                matchIndex: match.index,
              });
              errors.push({
                id: errorId,
                originalText,
                improvementText,
                path,
              });
              occurrenceIndex++;
            }
          }
        );
      }
    }

    console.log("Error List after processing student writing:", errors);

    setErrorList(errors);
    setErrorsUpdated(true); // Set the flag to true
  }

  if (!assignment) {
    return <p>Loading assignment details...</p>;
  }

  return (
    <div className="page-container flex flex-col">
      {/* Header */}
      <header className="header flex justify-between items-center p-4">
        <div className="logo-container">
          <Link href="/">
            <h1 style={{ cursor: "pointer" }}>Home</h1>
          </Link>
          <h1 className="text-xl font-semibold ml-5">{assignment.title}</h1>
          <h2 className="text-lg font-medium ml-5">{assignment.subject}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeProvider>
            <ModeToggle />
          </ThemeProvider>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        <main className="flex-grow overflow-hidden" style={{ minHeight: 0 }}>
          <div className="flex flex-col flex-grow space-y-4">
            {/* Container 2: Learning Outcome and Marking Criteria */}
            <div className="container-2 w-full mb-5 border border-gray-400 p-4 rounded-lg">
              <Accordion type="single" collapsible>
                {/* Learning Outcome Accordion */}
                <AccordionItem value="learning-outcome">
                  <AccordionTrigger
                    style={{ borderBottom: "2px solid #a1a5ab" }}
                  >
                    Learning Outcome, Marking Criteria and Additional Prompt
                  </AccordionTrigger>
                  <AccordionContent>
                    <textarea
                      value={learningOutcome}
                      readOnly
                      rows={5}
                      className="textarea w-full p-2 border border-gray-200 rounded"
                      placeholder="Enter learning outcomes here..."
                    />
                    <textarea
                      value={markingCriteria}
                      readOnly
                      rows={6}
                      className="textarea w-full p-2 border border-gray-300 rounded"
                      placeholder="Enter marking criteria here..."
                    />
                    {/* Updated Additional Prompt Display */}
                    <div className="additional-prompt-page read-only">
                      {renderMentions(additionalPrompt)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Container 3: Student Writing and Feedback side by side */}
            <div className="flex flex-grow overflow-hidden">
              <PanelGroup direction="horizontal" className="flex flex-grow">
                {/* Left Panel: Student Writing */}
                <Panel
                  className="p-4 flex flex-col flex-grow overflow-hidden"
                  style={{ minHeight: 0 }}
                >
                  <div
                    style={{
                      flexGrow: 1,
                      overflowY: "auto",
                      minHeight: 0,
                    }}
                  >
                    <h2 className="text-lg">Student Writing</h2>
                    {/* Use the SlateEditor */}
                    <SlateEditor
                      ref={slateEditorRef}
                      value={editorValue}
                      onChange={setEditorValue}
                      errorList={errorList}
                      errorsUpdated={errorsUpdated}
                      setErrorsUpdated={setErrorsUpdated}
                      updateErrorPositions={updateErrorPositions}
                      hoveredErrorIdRef={hoveredErrorIdRef}
                      hoverEventEmitter={hoverEventEmitter}
                      onContentHeightChange={setEditorContentHeight}
                    />
                  </div>
                  {/* Submit Button below Student Writing */}
                  <div className="mt-4">
                    <button
                      className="btn"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      Get Feedback
                    </button>
                  </div>
                </Panel>

                {/* Resize Handle */}
                <PanelResizeHandle className="w-1 bg-gray-200 cursor-col-resize" />

                {/* Right Panel: Feedback and Additional Feedback */}
                <Panel
                  className="p-4 flex flex-col flex-grow overflow-hidden"
                  style={{ minHeight: 0 }}
                >
                  <h2 className="text-lg">Improvements</h2>
                  {/* Improvements Section */}
                  <Improvements
                    ref={improvementsRef}
                    errorList={errorList}
                    hoveredErrorIdRef={hoveredErrorIdRef}
                    hoverEventEmitter={hoverEventEmitter}
                    editorContentHeight={editorContentHeight}
                  />
                  {/* Additional Feedback section */}
                  <div
                    className="flex-grow"
                    style={{ maxHeight: "100px" }}
                  >
                    <div className="feedback-box">
                      {loading ? (
                        <div className="loading">
                          Generating feedback...
                        </div>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {displayedFeedback
                            .replace(
                              "Areas of Improvement: ",
                              "**Areas of Improvement:**"
                            )
                            .replace(
                              "Areas of Improvement: \n\n",
                              "**Areas of Improvement:**"
                            )}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
