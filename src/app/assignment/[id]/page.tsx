// AssignmentPage.tsx
"use client";
import React, { useState, useEffect, useRef,useCallback, useMemo,} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./../../globals.css";
import { Accordion,AccordionItem, AccordionTrigger, AccordionContent,} from "@/components/ui/accordion";
import { PanelResizeHandle, Panel, PanelGroup,} from "react-resizable-panels";
import { Node, Path, Text, Descendant } from "slate";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import SlateEditor from "./SlateEditor";
import Improvements from "./Improvements";
import { EventEmitter } from "./EventEmitter";
import { escapeRegExp } from "./utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";

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
      lineNumber?: number;
    }>
  >([]);
  const hoveredErrorIdRef = useRef<string | null>(null);
  const [lineCount, setLineCount] = useState(1);
  const [errorsUpdated, setErrorsUpdated] = useState(false);
  const slateEditorRef = useRef<any>(null);
  const improvementsRef = useRef<any>(null);
  const isSyncingScroll = useRef(false);
  const hoverEventEmitter = useMemo(() => new EventEmitter(), []);

  const lineHeight = 20; // Define a shared line height

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
  const updateErrorLineNumbers = (
    lineNumbers: { [errorId: string]: number }
  ) => {
    setErrorList((prevErrorList) =>
      prevErrorList.map((error) => ({
        ...error,
        lineNumber: lineNumbers[error.id],
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

      const ratio =
        editorContainer.scrollTop /
        (editorContainer.scrollHeight - editorContainer.clientHeight);

      console.log("Editor scrollTop:", editorContainer.scrollTop);
      console.log("Editor scrollHeight:", editorContainer.scrollHeight);
      console.log("Editor clientHeight:", editorContainer.clientHeight);
      console.log("Editor scroll ratio:", ratio);

      improvementsContainer.scrollTop =
        ratio *
        (improvementsContainer.scrollHeight -
          improvementsContainer.clientHeight);

      isSyncingScroll.current = false;
    };

    const onImprovementsScroll = () => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;

      const ratio =
        improvementsContainer.scrollTop /
        (improvementsContainer.scrollHeight -
          improvementsContainer.clientHeight);

      console.log("Improvements scrollTop:", improvementsContainer.scrollTop);
      console.log("Improvements scrollHeight:", improvementsContainer.scrollHeight);
      console.log("Improvements clientHeight:", improvementsContainer.clientHeight);
      console.log("Improvements scroll ratio:", ratio);

      editorContainer.scrollTop =
        ratio *
        (editorContainer.scrollHeight - editorContainer.clientHeight);

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

  // Event handlers
  async function handleSubmit() {
    // Scroll the editor to the top when the button is clicked
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

        // After processing feedback and updating the error list, synchronize scroll
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
      lineNumber?: number;
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

  // Now, move the conditional return after hooks
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
          {/* Replace PopoverDemo with your component or remove if not needed */}
          {/* <PopoverDemo initialText={assignment.additionalPrompt} /> */}
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
                    Learning Outcome
                  </AccordionTrigger>
                  <AccordionContent>
                    <textarea
                      value={learningOutcome}
                      readOnly
                      rows={5}
                      className="textarea w-full p-2 border border-gray-200 rounded"
                      placeholder="Enter learning outcomes here..."
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Marking Criteria Accordion */}
                <AccordionItem value="marking-criteria">
                  <AccordionTrigger
                    style={{ borderBottom: "2px solid #a1a5ab" }}
                  >
                    Marking Criteria
                  </AccordionTrigger>
                  <AccordionContent>
                    <textarea
                      value={markingCriteria}
                      readOnly
                      rows={5}
                      className="textarea w-full p-2 border border-gray-300 rounded"
                      placeholder="Enter marking criteria here..."
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Additional Prompt */}
                <AccordionItem value="Additional Prompt">
                  <AccordionTrigger
                    style={{ borderBottom: "2px solid #a1a5ab" }}
                  >
                    Additional Prompt
                  </AccordionTrigger>
                  <AccordionContent>
                    <textarea
                      value={assignment.additionalPrompt}
                      readOnly
                      rows={5}
                      className="textarea w-full p-2 border border-gray-300 rounded"
                    />
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
                      onLineChange={setLineCount}
                      errorsUpdated={errorsUpdated}
                      setErrorsUpdated={setErrorsUpdated}
                      updateErrorLineNumbers={updateErrorLineNumbers}
                      hoveredErrorIdRef={hoveredErrorIdRef}
                      hoverEventEmitter={hoverEventEmitter}
                      lineHeight={lineHeight} // Pass lineHeight as a prop
                    />
                  </div>
                  {/* TEST Line Count */}
                  {/* <p>Total number of lines: {lineCount}</p> */}
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
                <Panel className="p-4 flex flex-col flex-grow overflow-hidden" style={{ minHeight: 0 }}>
                <Tabs defaultValue="Line-Feedback" className="w-full">
                  <TabsList>
                    <TabsTrigger value="Line-Feedback">Line Feedback</TabsTrigger>
                    <TabsTrigger value="Additional-Feedback">Additional Feedback</TabsTrigger>
                  </TabsList>
                  <TabsContent value="Line-Feedback">
                    {/* Improvements Section */}
                    <Improvements
                      ref={improvementsRef}
                      errorList={errorList}
                      lineCount={lineCount}
                      hoveredErrorIdRef={hoveredErrorIdRef}
                      hoverEventEmitter={hoverEventEmitter}
                      lineHeight={lineHeight} // Pass lineHeight as a prop
                    />
                  </TabsContent>
                  <TabsContent value="Additional-Feedback">
                    {/* Move the Additional Feedback section here */}
                    <div className="flex-grow" style={{ maxHeight: "200px" }}>
                      <div className="feedback-box overflow-y-auto">
                        {loading ? (
                          <div className="loading">Generating feedback...</div>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {displayedFeedback.replace("Areas of Improvement: ", "**Areas of Improvement:**").replace("Areas of Improvement: \n\n", "**Areas of Improvement:**")}
                            </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                </Panel>
              </PanelGroup>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
