import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
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
  }>;
  errorsUpdated: boolean;
  setErrorsUpdated: (value: boolean) => void;
  updateErrorPositions: (
    positions: { [errorId: string]: { offsetTop: number; height: number } }
  ) => void;
  hoveredErrorIdRef: React.MutableRefObject<string | null>;
  hoverEventEmitter: EventEmitter;
  onContentHeightChange?: (height: number) => void;
}

const SlateEditor = forwardRef((props: SlateEditorProps, ref) => {
  const {
    value,
    onChange,
    errorList,
    errorsUpdated,
    setErrorsUpdated,
    updateErrorPositions,
    hoveredErrorIdRef,
    hoverEventEmitter,
    onContentHeightChange,
  } = props;

  const { theme } = useTheme();
  const editor = useRef(withReact(createEditor())).current;
  const containerRef = useRef<HTMLDivElement>(null);
  const errorSpanRefs = useRef<{ [key: string]: HTMLElement | null }>({});

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
      if (!Text.isText(node)) return ranges;

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
    ({ attributes, children, leaf }: any) => {
      if (leaf.errorId) {
        const isHovered = hoveredErrorIdRef.current === leaf.errorId;
        const isDarkMode = theme === "dark";

        const backgroundColor = isHovered
          ? isDarkMode
            ? "#6BAC68"
            : "yellow"
          : isDarkMode
          ? "#144D14"
          : "lightyellow";

        return (
          <span
            {...attributes}
            ref={(el) => {
              if (el) errorSpanRefs.current[leaf.errorId] = el;
            }}
            style={{ backgroundColor }}
            onMouseEnter={() => {
              hoveredErrorIdRef.current = leaf.errorId;
              hoverEventEmitter.emit("hoverChange", leaf.errorId);
            }}
            onMouseLeave={() => {
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
    [hoveredErrorIdRef, hoverEventEmitter, theme]
  );

  const handleChange = (newValue: Descendant[]) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    if (errorsUpdated && containerRef.current) {
      const editorElement = containerRef.current;

      const errorPositions: {
        [errorId: string]: { offsetTop: number; height: number };
      } = {};
      Object.keys(errorSpanRefs.current).forEach((errorOccurrenceId) => {
        const spanElement = errorSpanRefs.current[errorOccurrenceId];
        if (spanElement) {
          const offsetTop =
            spanElement.getBoundingClientRect().top -
            editorElement.getBoundingClientRect().top +
            editorElement.scrollTop;
          const height = spanElement.getBoundingClientRect().height;
          errorPositions[errorOccurrenceId] = { offsetTop, height };
        }
      });

      updateErrorPositions(errorPositions);
      setErrorsUpdated(false);
    }
  }, [errorsUpdated, setErrorsUpdated, updateErrorPositions, errorSpanRefs]);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current && onContentHeightChange) {
        const contentHeight = containerRef.current.scrollHeight;
        onContentHeightChange(contentHeight);
      }
    };

    updateHeight();
    const observer = new MutationObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [value, errorsUpdated, onContentHeightChange]);

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <div
        ref={containerRef}
        className="editor-content"
        style={{
          boxSizing: "border-box",
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "380px",
          width: "100%",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          overflowY: "auto",
          maxHeight: "380px",
        }}
      >
        <Editable
          decorate={decorate}
          renderLeaf={renderLeaf}
          placeholder="Enter student writing..."
          style={{ outline: "none" }}
        />
      </div>
    </Slate>
  );
});
SlateEditor.displayName = "SlateEditor";
export default SlateEditor;
