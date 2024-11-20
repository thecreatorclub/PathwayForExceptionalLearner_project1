"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./../../globals.css";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { PanelResizeHandle, Panel, PanelGroup } from "react-resizable-panels";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor, Descendant, Text, Node, Path } from "slate";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";

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
  // Assignment state
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  // Other state variables
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
    Array<{ id: string; originalText: string; improvementText: string; path: Path }>
  >([]);

  // Bring back hoveredErrorId to the parent component
  const [hoveredErrorId, setHoveredErrorId] = useState<string | null>(null);

  useEffect(() => {
    const savedPrompt = localStorage.getItem("additionalPrompt");
    if (savedPrompt) {
      setAdditionalPrompt(savedPrompt);
    }
  }, []);

  // Fetch assignment data
  useEffect(() => {
    fetch(`/api/assignment/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setAssignment(data);
        setLearningOutcome(data.learningOutcomes);
        setMarkingCriteria(data.markingCriteria);
      });
  }, [params.id]);

  const SlateEditor = ({
    value,
    onChange,
    errorList,
    onHoverError,
    hoveredErrorId,
  }: {
    value: Descendant[];
    onChange: (value: Descendant[]) => void;
    errorList: Array<{ id: string; originalText: string; path: Path }>;
    onHoverError: (id: string | null) => void;
    hoveredErrorId: string | null;
  }) => {
    const editor = useMemo(() => withReact(createEditor()), []);

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const decorate = useCallback(
      ([node, path]: [Node, Path]) => {
        const ranges: Array<{
          anchor: { path: Path; offset: number };
          focus: { path: Path; offset: number };
          errorId: string;
        }> = [];
        if (!Text.isText(node)) {
          return ranges;
        }

        const { text } = node;

        errorList.forEach((error) => {
          const { id, originalText, path: errorPath } = error;

          if (Path.equals(path, errorPath)) {
            const regex = new RegExp(escapeRegExp(originalText), "gi");
            let match;

            while ((match = regex.exec(text)) !== null) {
              ranges.push({
                anchor: { path, offset: match.index },
                focus: { path, offset: match.index + match[0].length },
                errorId: id,
              });
            }
          }
        });

        return ranges;
      },
      [errorList]
    );

    const renderLeaf = useCallback(
      (props: { attributes: any; children: React.ReactNode; leaf: any }) => {
        const { attributes, children, leaf } = props;

        if (leaf.errorId) {
          return (
            <span
              {...attributes}
              style={{
                backgroundColor:
                  hoveredErrorId === leaf.errorId ? "yellow" : "lightyellow",
              }}
              onMouseEnter={() => onHoverError(leaf.errorId)}
              onMouseLeave={() => onHoverError(null)}
            >
              {children}
            </span>
          );
        }

        return <span {...attributes}>{children}</span>;
      },
      [hoveredErrorId, onHoverError]
    );

    const handleChange = (newValue: Descendant[]) => {
      if (newValue) {
        onChange(newValue);
      }
    };

    return (
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        <Editable
          decorate={decorate}
          renderLeaf={renderLeaf}
          placeholder="Enter student writing..."
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            minHeight: "150px",
            width: "100%",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />
      </Slate>
    );
  };

  const processStudentWriting = (
    editorValue: Descendant[],
    replacements: { originalText: string; improvementText: string }[]
  ) => {
    let errorList: Array<{
      id: string;
      originalText: string;
      improvementText: string;
      path: Path;
    }> = [];

    for (const [node, path] of Node.nodes({ children: editorValue })) {
      if (Text.isText(node)) {
        const text = node.text;
        replacements.forEach(({ originalText, improvementText }, errorIndex) => {
          if (text.toLowerCase().includes(originalText.toLowerCase())) {
            const id = `${Path.toString()}-${errorIndex}`;
            errorList.push({
              id,
              originalText,
              improvementText,
              path,
            });
          }
        });
      }
    }

    return errorList;
  };

  const extractFeedback = (feedback: string) => {
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

    const errorList = processStudentWriting(editorValue, replacements);
    setErrorList(errorList);
  };

  const handleSubmit = async () => {
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
      } else {
        setFeedback("Error: Unable to get feedback.");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedback("Error: Unable to get feedback.");
    } finally {
      setLoading(false);
    }
  };

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
                  <h2 className="text-lg font-semibold mb-2">
                    Student Writing
                  </h2>
                  <div
                style={{
                      flexGrow: 1,
                      overflowY: "auto",
                      minHeight: 0,
                }}
              >
                    {/* Use the memoized SlateEditor */}
                    <MemoizedSlateEditor
                    value={editorValue}
                    onChange={setEditorValue}
                    errorList={errorList}
                    onHoverError={setHoveredErrorId}
                    hoveredErrorId={hoveredErrorId}
                  />

                  </div>
                  {/* Submit Button below Student Writing */}
                  <div className="mt-4">
                    <button
                      onClick={handleSubmit}
                      className="submit-button px-4 py-2 bg-blue-500 text-white rounded"
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
                <h2 className="text-lg font-semibold mb-2">Improvements</h2>

                  {/* Improvements Section */}
                <div
                  className="improvement-box"
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                      overflowY: "auto",
                      maxHeight: "200px",
                      flexShrink: 0,
                  }}
                >
                  {errorList.map((error) => (
                    <div
                      key={error.id}
                      style={{
                        backgroundColor:
                          hoveredErrorId === error.id ? "yellow" : "transparent",
                      }}
                      onMouseEnter={() => setHoveredErrorId(error.id)}
                      onMouseLeave={() => setHoveredErrorId(null)}
                    >
                      {error.improvementText}
                    </div>
                    
                  ))}
                </div>
                  {/* Feedback Section */}
                  <h2 className="text-lg font-semibold mb-2">
                    Additional Feedback
                  </h2>
                  <div
                    className="feedback-box flex-grow overflow-y-auto"
                    style={{ maxHeight: "200px" }}
                  >
                    {loading ? (
                      <div className="loading">Generating feedback...</div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayedFeedback}
                      </ReactMarkdown>
                    )}
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
