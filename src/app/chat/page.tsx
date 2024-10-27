"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Draggable from "react-draggable";
import "../globals.css";
import SideNavBar from "@/components/sidebar/sidenav";
import PopoverDemo from "@/components/ui/popover-demo";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PanelResizeHandle, Panel, PanelGroup } from "react-resizable-panels";
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor, Descendant, Text, Node, Path, Range } from 'slate';


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
      const ranges: Array<{ anchor: { path: Path; offset: number }; focus: { path: Path; offset: number }; errorId: string }> = [];
      if (!Text.isText(node)) {
        return ranges;
      }

      const { text } = node;

      errorList.forEach((error) => {
        const { id, originalText, path: errorPath } = error;

        if (Path.equals(path, errorPath)) {
          const regex = new RegExp(escapeRegExp(originalText), 'gi');
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
              backgroundColor: hoveredErrorId === leaf.errorId ? 'yellow' : 'lightyellow',
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

const Page2 = () => {
  const [learningOutcome, setLearningOutcome] = useState("");
  const [markingCriteria, setMarkingCriteria] = useState("");

  const [editorValue, setEditorValue] = useState<Descendant[]>([
    {
      children: [{ text: '' }],
    },
  ]);

  const [feedback, setFeedback] = useState("");
  const [displayedFeedback, setDisplayedFeedback] = useState("");
  const feedbackIndexRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSideNavOpen, setIsSideNavOpen] = useState(true);

  const [errorList, setErrorList] = useState<
    Array<{ id: string; originalText: string; improvementText: string; path: Path }>
  >([]);

  const [hoveredErrorId, setHoveredErrorId] = useState<string | null>(null);

  const toggleSideNav = () => setIsSideNavOpen(!isSideNavOpen);

  const handleSaveAdditionalPrompt = useCallback((prompt: string) => {
    setAdditionalPrompt(prompt);
    localStorage.setItem("additionalPrompt", prompt);
  }, []);

  const handleClearAdditionalPrompt = useCallback(() => {
    setAdditionalPrompt("");
    localStorage.removeItem("additionalPrompt");
  }, []);

  useEffect(() => {
    const savedPrompt = localStorage.getItem("additionalPrompt");
    if (savedPrompt) {
      setAdditionalPrompt(savedPrompt);
    }
  }, []);

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  function processStudentWriting(
    editorValue: Descendant[],
    replacements: { originalText: string; improvementText: string }[]
  ) {
    let errorList: Array<{ id: string; originalText: string; improvementText: string; path: Path }> = [];

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
  }

  const extractFeedback = (feedback: string) => {
    const originalTextRegex = /\*\*Original Text:\*\*\s*"([^"]+)"\s*<endoforiginal>/gi;
    const improvementRegex = /\*\*Improvement:\*\*\s*([\s\S]*?)<endofimprovement>/g;

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
      const studentWritingText = editorValue.map(line => Node.string(line)).join('\n');

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
          .replace(/\*\*Original Text:\*\*\s*"([^"]+)"\s*<endoforiginal>/gi, "")
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

  return (
    <div className="page-container flex flex-col">
      {/* Header */}
      <header className="header flex justify-between items-center p-4">
        <div className="logo-container">
          <span className="logo-text text-xl font-semibold">“We are Learners”</span>
        </div>
        <div className="flex items-center space-x-4">
          {/*<UserButton />*/}
          <PopoverDemo
            initialPrompt={additionalPrompt}
            onSave={handleSaveAdditionalPrompt}
            onClear={handleClearAdditionalPrompt}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Draggable Side Navigation */}
        <Draggable handle=".draggable-handle">
          <div
            className={`sidenav w-64 bg-white shadow-md ${isSideNavOpen ? "" : "hidden"}`}
            style={{ position: "absolute", zIndex: 1000 }}
          >
            <div className="draggable-handle p-2 bg-gray-700 text-white cursor-move">
              Drag Me
            </div>
            <button
              onClick={toggleSideNav}
              className="p-2 text-white bg-red-500 hover:bg-red-600"
            >
              {isSideNavOpen ? "Close" : "Open"} Nav
            </button>
            <SideNavBar />
          </div>
        </Draggable>

        <main className="flex-1 p-4 overflow-auto">
          <div className="flex flex-col space-y-4"style={{ height: '200vh', width: '500vh'}}>
            {/* Top PanelGroup */}
            <PanelGroup direction="horizontal">
              {/* Left Panel: Learning Outcome and Marking Criteria */}
              <Panel className="p-4" defaultSize={50} minSize={30}>
                <div className="accordion-container" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {/* Learning Outcome Accordion */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="learning-outcome">
                        <AccordionTrigger style={{borderBottom: '2px solid #a1a5ab'}}>Learning Outcome</AccordionTrigger>
                        <AccordionContent>
                          <div>
                            <textarea
                              value={learningOutcome}
                              onChange={(e) => setLearningOutcome(e.target.value)}
                              rows={10}
                              className="textarea w-full p-2 border border-gray-300 rounded"
                              placeholder="Enter learning outcomes here..."
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {/* Marking Criteria Accordion */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="marking-criteria">
                        <AccordionTrigger style={{borderBottom: '2px solid #a1a5ab'}}>Marking Criteria</AccordionTrigger>
                        <AccordionContent>
                          <div>
                            <textarea
                              value={markingCriteria}
                              onChange={(e) => setMarkingCriteria(e.target.value)}
                              rows={10}
                              className="textarea w-full p-2 border border-gray-300 rounded"
                              placeholder="Enter marking criteria here..."
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </Panel>

              {/* Resize Handle */}
              <PanelResizeHandle className="w-1 bg-gray-200 cursor-col-resize" />

              {/* Right Panel: Feedback */}
              <Panel className="p-4" minSize={30} defaultSize={50}>
                <div
                  className="feedback-box"
                  style={{ maxHeight: "625px", maxWidth: "700px", overflowY: "auto" }}
                >
                  <h2>Feedback</h2>
                  {loading ? (
                    <div className="loading">Generating feedback...</div>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedFeedback}</ReactMarkdown>
                  )}
                </div>
              </Panel>
            </PanelGroup>

            {/* Bottom PanelGroup */}
              <PanelGroup direction="horizontal">
                {/* Left Panel: Student Writing */}
                <Panel
                  className="p-4"
                  style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}
                >
                  <h2 className="text-lg font-semibold mb-2">Student Writing</h2>
                    <div style={{ flexGrow: 1}}>
                    <SlateEditor
                      value={editorValue}
                      onChange={setEditorValue}
                      errorList={errorList}
                      onHoverError={setHoveredErrorId}
                      hoveredErrorId={hoveredErrorId}
                    />
                    </div>
                </Panel>

                {/* Resize Handle */}
                <PanelResizeHandle className="w-1 bg-gray-200 cursor-col-resize" />

                {/* Right Panel: Improvements */}
                <Panel
                  className="p-4"
                  style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}
                >
                  <h2 className="text-lg font-semibold mb-2">Improvements</h2>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div className="Improvement-box"
                      style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    >
                      {errorList.map((error) => (
                        <div
                          key={error.id}
                          style={{
                            backgroundColor:
                              hoveredErrorId === error.id ? 'yellow' : 'transparent',
                          }}
                          onMouseEnter={() => setHoveredErrorId(error.id)}
                          onMouseLeave={() => setHoveredErrorId(null)}
                        >
                          {error.improvementText}
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </PanelGroup>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="submit-button px-4 py-2 bg-blue-500 text-white rounded"
              >
                Get Feedback
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page2;