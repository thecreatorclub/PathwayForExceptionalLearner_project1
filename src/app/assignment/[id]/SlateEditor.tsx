// SlateEditor.tsx
import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor, Descendant, Text, Node, Path } from "slate";
import { EventEmitter } from "./EventEmitter";
import { escapeRegExp } from "./utils";
import { useTheme } from "next-themes";

interface SlateEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  errorList: Array<{
    id: string;
    originalText: string;
    improvementText: string;
    path: Path;
    lineNumber?: number;
  }>;
  onLineChange?: (lineCount: number) => void;
  errorsUpdated: boolean;
  setErrorsUpdated: (value: boolean) => void;
  updateErrorLineNumbers: (
    lineNumbers: { [errorId: string]: number }
  ) => void;
  hoveredErrorIdRef: React.MutableRefObject<string | null>;
  hoverEventEmitter: EventEmitter;
  lineHeight: number; // Add lineHeight to props
}

const SlateEditor = forwardRef((props: SlateEditorProps, ref) => {
  const {
    value,
    onChange,
    errorList,
    onLineChange,
    errorsUpdated,
    setErrorsUpdated,
    updateErrorLineNumbers,
    hoveredErrorIdRef,
    hoverEventEmitter,
    lineHeight, // Destructure lineHeight
  } = props;

  const { theme } = useTheme();
  const editor = useRef(withReact(createEditor())).current;
  const containerRef = useRef<HTMLDivElement>(null);
  const lineHeightRef = useRef<number>(20);
  const errorSpanRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [localHoveredErrorId, setLocalHoveredErrorId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const handleHoverChange = (id: string | null) => {
      setLocalHoveredErrorId(id);
    };

    hoverEventEmitter.on("hoverChange", handleHoverChange);

    return () => {
      hoverEventEmitter.off("hoverChange", handleHoverChange);
    };
  }, [hoverEventEmitter]);

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    },
    getContainer: () => containerRef.current,
  }));

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
          let occurrenceIndex = 0;

          while ((match = regex.exec(text)) !== null) {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;

            ranges.push({
              anchor: { path, offset: matchStart },
              focus: { path, offset: matchEnd },
              errorId: error.id,
            });

            occurrenceIndex++;
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
        const isHovered = localHoveredErrorId === leaf.errorId;
        const isDarkMode = theme === "dark";

        const backgroundColor = isHovered
          ? isDarkMode
            ? "#6BAC68" // Hovered color in dark mode
            : "yellow"   // Hovered color in light mode
          : isDarkMode
            ? "#144D14"  // Default color in dark mode
            : "lightyellow"; // Default color in light mode

        return (
          <span
            {...attributes}
            ref={(el) => {
              if (el) {
                errorSpanRefs.current[leaf.errorId] = el;
              }
            }}
            style={{ backgroundColor }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              hoveredErrorIdRef.current = leaf.errorId;
              hoverEventEmitter.emit("hoverChange", leaf.errorId);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              hoveredErrorIdRef.current = null;
              hoverEventEmitter.emit("hoverChange", null);
            }}
          >
            {children}
          </span>
        );
      }

      return <span {...attributes}>{children}</span>;
    },
    [localHoveredErrorId, hoverEventEmitter, hoveredErrorIdRef, theme]
  );

  const handleChange = (newValue: Descendant[]) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    if (errorsUpdated && containerRef.current) {
      const editorElement = containerRef.current;
      const height = editorElement.scrollHeight;
      const computedStyle = getComputedStyle(editorElement);
      let lineHeight = parseFloat(computedStyle.lineHeight);
      if (isNaN(lineHeight)) {
        lineHeight = lineHeightRef.current;
      }
      const currentLineCount = Math.round(height / lineHeight);
      if (onLineChange) {
        onLineChange(currentLineCount);
      }

      const lineNumbers: { [errorId: string]: number } = {};
      Object.keys(errorSpanRefs.current).forEach((errorOccurrenceId) => {
        const spanElement = errorSpanRefs.current[errorOccurrenceId];
        if (spanElement) {
          const offsetTop =
            spanElement.getBoundingClientRect().top -
            editorElement.getBoundingClientRect().top;
          const lineNumber = Math.floor(offsetTop / lineHeight) + 1;
          lineNumbers[errorOccurrenceId] = lineNumber;
        }
      });

      updateErrorLineNumbers(lineNumbers);
      setErrorsUpdated(false);
    }
  }, [
    errorsUpdated,
    onLineChange,
    setErrorsUpdated,
    updateErrorLineNumbers,
    errorSpanRefs,
  ]);

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <div
        ref={containerRef}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "380px",
          width: "100%",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          lineHeight: `${lineHeight}px`, // Use the passed lineHeight
          overflowY: "auto",
          maxHeight: "380px",
        }}
      >
        <Editable
          decorate={decorate}
          renderLeaf={renderLeaf}
          placeholder="Enter student writing..."
          style={{
            outline: "none",
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              console.log("Enter key pressed");
            }
          }}
        />
      </div>
    </Slate>
  );
});
SlateEditor.displayName = "SlateEditor";
export default SlateEditor;
