import { useTheme } from "next-themes";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { createEditor, Descendant, Node, Path, Text } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { EventEmitter } from "./EventEmitter";
import {
  escapeRegExp,
  findRichTextPixelPosition,
  type PositionedTextError,
  type TextError,
} from "./utils";

interface SlateEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  errorList: TextError[];
  updateErrorPositions: (positions: PositionedTextError[]) => void;
  hoveredErrorIdRef: React.MutableRefObject<string | null>;
  hoverEventEmitter: EventEmitter;
}

let SlateEditor: React.ForwardRefExoticComponent<
  SlateEditorProps & { ref: any }
> = forwardRef((props: SlateEditorProps, ref) => {
  const {
    value,
    onChange,
    errorList,
    updateErrorPositions,
    hoveredErrorIdRef,
    hoverEventEmitter,
  } = props;

  const { theme } = useTheme();
  const editor = useRef(withReact(createEditor())).current;
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    },
    getContainer: () => containerRef.current,
  }));

  function updatePositions() {
    const errorPositions: PositionedTextError[] = [];
    const editorElement = containerRef.current;

    if (editorElement) {
      for (const error of errorList) {
        const position = findRichTextPixelPosition(
          editorElement,
          error.originalText
        );

        if (position) {
          errorPositions.push({
            ...error,
            offsetTop: position.top,
            height: position.height,
          });
        }
        console.log("Position:", position);
      }
      updateErrorPositions(errorPositions);
    }
  }

  // resize observer updates positions of annotations
  // when the slate editor is resized
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      console.log(entries);
      updatePositions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [errorList]);

  const decorate = useCallback(
    ([node, path]: [Node, Path]) => {
      const ranges: Array<{
        anchor: { path: Path; offset: number };
        focus: { path: Path; offset: number };
        errorId: string;
      }> = [];
      if (!Text.isText(node)) return ranges;

      const { text } = node;

      for (const error of errorList) {
        const { originalText } = error;

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
    updatePositions();
  });

  // useEffect(() => {
  //   if (errorsUpdated && containerRef.current) {
  //     const editorElement = containerRef.current;

  //     const errorPositions: {
  //       [errorId: string]: { offsetTop: number; height: number };
  //     } = {};

  //     for (const errorOccurrenceId of Object.keys(errorSpanRefs.current)) {
  //       const spanElement = errorSpanRefs.current[errorOccurrenceId];
  //       if (spanElement) {
  //         const offsetTop =
  //           spanElement.getBoundingClientRect().top -
  //           editorElement.getBoundingClientRect().top +
  //           editorElement.scrollTop;
  //         const height = spanElement.getBoundingClientRect().height;
  //         errorPositions[errorOccurrenceId] = { offsetTop, height };
  //       }
  //     }

  //     updateErrorPositions(errorPositions);
  //     setErrorsUpdated(false);
  //   }
  // }, [errorsUpdated, setErrorsUpdated, updateErrorPositions, errorSpanRefs]);

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <div
        className="editor-content"
        style={{
          boxSizing: "border-box",
          border: "0px",
          padding: "10px",
          height: "100%",
          width: "100%",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          overflowY: "auto",
        }}
      >
        <Editable
          ref={containerRef}
          decorate={decorate}
          renderLeaf={renderLeaf}
          placeholder="Enter student writing..."
          style={{ outline: "none" }}
        />
      </div>
    </Slate>
  );
});

SlateEditor = memo(SlateEditor);
SlateEditor.displayName = "SlateEditor";

export default SlateEditor;
