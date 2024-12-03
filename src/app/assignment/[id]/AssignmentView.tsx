"use client";

import type { Assignment } from "@prisma/client";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { Button, Heading } from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import remarkGfm from "remark-gfm";
import { Descendant, Node } from "slate";
import styles from "./AssignmentView.module.css";
import { EventEmitter } from "./EventEmitter";
import Improvements from "./Improvements";
import SlateEditor from "./SlateEditor";
import {
  extractFeedback,
  type PositionedTextError,
  type TextError,
} from "./utils";

const response = {
  message:
    'Your writing provides an overview of World Heritage sites and argues for the inclusion of the Sydney Opera House on the UNESCO World Heritage list. You have structured your report with clear sections, which helps in organizing your thoughts. However, there are several factual inaccuracies and some areas where your arguments could be strengthened.\n\n- **Original Text:** "Examples of World Heritage sites include the Eiffel Tower in Italy, the Grand Canyon in Australia, and the Great Wall of France."<endoforiginal>\n  - **Improvement:** The Eiffel Tower is in France, the Grand Canyon is in the United States, and the Great Wall is in China. It\'s important to verify the locations of these sites to maintain accuracy.<endofimprovement>\n\n- **Original Text:** "The Sydney Opera House, located in Sydney, Canada, is an architectural wonder..."<endoforiginal>\n  - **Improvement:** The Sydney Opera House is located in Sydney, Australia, not Canada. Correcting this will ensure geographical accuracy.<endofimprovement>\n\n- **Original Text:** "Sites such as the Sahara Rainforest, which has abundant water resources and lush greenery..."<endoforiginal>\n  - **Improvement:** The Sahara is a desert, not a rainforest. This statement is factually incorrect and should be revised to reflect accurate information.<endofimprovement>\n\n- **Original Text:** "cultural sites like the Leaning Tower of New York..."<endoforiginal>\n  - **Improvement:** The Leaning Tower is located in Pisa, Italy, not New York. Ensure that cultural sites are correctly identified.<endofimprovement>\n\n- **Original Text:** "Built by an ancient Australian civilization in 2003..."<endoforiginal>\n  - **Improvement:** The Sydney Opera House was completed in 1973, not 2003, and was not built by an ancient civilization. Correcting these details will enhance the credibility of your argument.<endofimprovement>\n\n- **Original Text:** "Its designer, Bill Utzon, used Roman blueprints from the 15th century..."<endoforiginal>\n  - **Improvement:** The designer\'s name is Jørn Utzon, and the use of Roman blueprints is not accurate. Ensure that historical and architectural details are correct.<endofimprovement>\n\n**Suggestions for Enhancement**:\n- Consider using more reliable sources to gather accurate geographical and historical information.\n- Strengthen your argument by providing more detailed evidence and examples of the Sydney Opera House\'s significance.\n- Use advanced techniques like metaphor or symbolism to enhance your descriptions of the Opera House\'s architectural features.\n\n**Detailed Analysis**:\nYour work demonstrates an attempt to gather and organize geographical information, but factual inaccuracies undermine the effectiveness of your report. The arguments for the Sydney Opera House\'s inclusion on the World Heritage list are creative but need to be grounded in reality. Your communication is clear, but the content requires more depth and accuracy to meet the learning outcomes and marking criteria.\n\n**Conclusion**:\nI encourage you to verify your facts and refine your arguments to improve the quality of your report. By addressing these issues, you will enhance the credibility and impact of your work.\n\n**Scoring**:\n- Identifying and gathering geographical information: Needs Improvement\n- Organizing and interpreting geographical information: Needs Improvement\n- Using a range of forms to communicate: Satisfactory\n- Demonstrating a sense of place about global environments: Needs Improvement',
};

const te = [
  {
    children: [
      {
        text: "World Heritage sites are locations deemed significant for their cultural or natural importance by UNESCO. Examples of World Heritage sites include the Eiffel Tower in Italy, the Grand Canyon in Australia, and the Great Wall of France. These sites represent a diverse range of environments and cultural histories, showcasing the ingenuity of past civilizations and the beauty of untouched natural landscapes.",
      },
    ],
  },
  {
    children: [
      {
        text: "",
      },
    ],
  },
  {
    children: [
      {
        text: "The Sydney Opera House, located in Sydney, Canada, is an architectural wonder and has been mistakenly left off the UNESCO World Heritage list despite its undeniable historical value.",
      },
    ],
  },
  {
    children: [
      {
        text: "",
      },
    ],
  },
  {
    children: [
      {
        text: "Importance of World Heritage Listings",
      },
    ],
  },
  {
    children: [
      {
        text: "World Heritage listings provide economic benefits by encouraging tourism and fostering international cooperation. Sites such as the Sahara Rainforest, which has abundant water resources and lush greenery, have thrived since their listing. Similarly, cultural sites like the Leaning Tower of New York are now well-maintained due to the funds they receive post-listing.",
      },
    ],
  },
  {
    children: [
      {
        text: "",
      },
    ],
  },
  {
    children: [
      {
        text: "The World Heritage listing ensures the local governments of these sites gain complete ownership, preventing international organizations or corporations from interfering with these significant landmarks.",
      },
    ],
  },
  {
    children: [
      {
        text: "",
      },
    ],
  },
  {
    children: [
      {
        text: "The Case for the Sydney Opera House",
      },
    ],
  },
  {
    children: [
      {
        text: "The Sydney Opera House should be included on the World Heritage list for the following reasons:",
      },
    ],
  },
  {
    children: [
      {
        text: "",
      },
    ],
  },
  {
    children: [
      {
        text: "Historical Importance: Built by an ancient Australian civilization in 2003, it holds cultural significance as a symbol of the colonial era.",
      },
    ],
  },
  {
    children: [
      {
        text: "Architectural Brilliance: Its designer, Bill Utzon, used Roman blueprints from the 15th century, blending history with modernity.",
      },
    ],
  },
  {
    children: [
      {
        text: "Environmental Impact: The Opera House is constructed entirely out of recycled materials, reducing carbon emissions and promoting eco-friendly construction techniques.",
      },
    ],
  },
  {
    children: [
      {
        text: "These attributes make the Sydney Opera House a vital addition to the World Heritage list, highlighting its role in global history.",
      },
    ],
  },
  {
    children: [
      {
        text: "",
      },
    ],
  },
  {
    children: [
      {
        text: "Conclusion",
      },
    ],
  },
  {
    children: [
      {
        text: "The recognition of sites like the Sydney Opera House will continue to inspire humanity, foster pride in our shared global history, and secure the preservation of significant landmarks. Including the Opera House in the UNESCO World Heritage list will ensure that future generations can appreciate its historical and architectural value.",
      },
    ],
  },
];

export function AssignmentView({ assignment }: { assignment: Assignment }) {
  // State and refs
  const [editorValue, setEditorValue] = useState<Descendant[]>(te);

  // const [editorValue, setEditorValue] = useState<Descendant[]>([
  //   {
  //     children: [{ text: "" }],
  //   },
  // ]);
  const [feedback, setFeedback] = useState("");
  const feedbackIndexRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [errorList, setErrorList] = useState<TextError[]>([]);
  const [positionedErrorList, setPositionedErrorList] = useState<
    PositionedTextError[]
  >([]);

  const hoveredErrorIdRef = useRef<string | null>(null);
  const slateEditorRef = useRef<any>(null);
  const improvementsRef = useRef<any>(null);
  const isSyncingScroll = useRef(false);
  const hoverEventEmitter = useMemo(() => new EventEmitter(), []);

  // testing
  useEffect(() => {
    const { errors, message } = extractFeedback(
      response.message || "No feedback received.",
      editorValue
    );

    setErrorList(errors);
    setFeedback(message);
  }, [editorValue]);

  // make sure both areas are the same size
  useEffect(() => {
    const editorContainer = slateEditorRef.current?.getContainer();
    const improvementsContainer = improvementsRef.current?.getContainer();

    improvementsContainer.style.height = `${editorContainer.clientHeight}px`;
  });

  // scroll both at the same time
  useEffect(() => {
    const editorContainer =
      slateEditorRef.current?.getContainer().parentElement;
    const improvementsContainer =
      improvementsRef.current?.getContainer().parentElement;

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
      improvementsContainer.removeEventListener("scroll", onImprovementsScroll);
    };
  }, []);

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
          learningOutcome: assignment.learningOutcomes,
          markingCriteria: assignment.markingCriteria,
          studentWriting: studentWritingText,
          additionalPrompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { errors, message } = extractFeedback(
          data.message || "No feedback received.",
          editorValue
        );

        setErrorList(errors);
        setFeedback(message);
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

  if (!assignment) {
    return <p>Loading assignment details...</p>;
  }

  return (
    <>
      {/* Container 3: Student Writing and Feedback side by side */}

      <PanelGroup direction="vertical" className="flex flex-grow flex-1">
        {/* Left Panel: Student Writing */}
        <Panel>
          <PanelGroup direction="horizontal">
            {/* Left Panel: Student Writing */}
            <Panel className="flex flex-col flex-grow overflow-hidden">
              <h2 className="text-lg font-bold bg-slate-400 px-4 py-1 dark:bg-gray-600">
                Student Writing
              </h2>
              {/* Use the SlateEditor */}
              <SlateEditor
                ref={slateEditorRef}
                value={editorValue}
                onChange={setEditorValue}
                errorList={errorList}
                updateErrorPositions={setPositionedErrorList}
                hoveredErrorIdRef={hoveredErrorIdRef}
                hoverEventEmitter={hoverEventEmitter}
              />
              {/* Submit Button below Student Writing */}
            </Panel>

            {/* Resize Handle */}
            <PanelResizeHandle className="w-[1px] bg-gray-200 dark:bg-gray-900 cursor-col-resize" />

            {/* Right Panel: Feedback and Additional Feedback */}
            <Panel
              className="flex flex-col flex-grow overflow-hidden"
              style={{ minHeight: 0 }}
            >
              <Heading
                size="2"
                className="text-lg font-bold bg-slate-400 px-4 py-1 dark:bg-gray-600"
              >
                Improvements
              </Heading>
              {/* Improvements Section */}
              <Improvements
                ref={improvementsRef}
                errorList={positionedErrorList}
                hoveredErrorIdRef={hoveredErrorIdRef}
                hoverEventEmitter={hoverEventEmitter}
              />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="h-[1px] bg-gray-200 cursor-col-resize dark:bg-gray-900" />
        <Panel className="flex flex-col overflow-hidden">
          {/* Additional Feedback section */}

          <Heading
            size="2"
            className="text-lg font-bold bg-slate-400 px-4 py-1 flex justify-between dark:bg-gray-600"
          >
            Feedback
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto font-bold"
            >
              <Pencil2Icon />
              Get Feedback
            </Button>
          </Heading>
          <div className={styles.markdown}>
            {loading ? (
              <div className="loading">Generating feedback...</div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {feedback
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
        </Panel>
      </PanelGroup>
    </>
  );
}
