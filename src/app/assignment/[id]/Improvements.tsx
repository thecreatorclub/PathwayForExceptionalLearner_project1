// Improvements.tsx
import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { EventEmitter } from "./EventEmitter";
import { useTheme } from "next-themes";

interface ImprovementsProps {
  errorList: Array<{
    id: string;
    originalText: string;
    improvementText: string;
    lineNumber?: number;
  }>;
  lineCount: number;
  hoveredErrorIdRef: React.MutableRefObject<string | null>;
  hoverEventEmitter: EventEmitter;
  lineHeight: number; // Add lineHeight to props
}

const Improvements = forwardRef((props: ImprovementsProps, ref) => {
  const { errorList, lineCount, hoveredErrorIdRef, hoverEventEmitter, lineHeight } = props;
  const { theme } = useTheme();
  const [localHoveredErrorId, setLocalHoveredErrorId] = useState<
    string | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    getContainer: () => containerRef.current,
  }));

  return (
    <div
      ref={containerRef}
      className="improvement-box"
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflowY: "auto",
        maxHeight: "380px",
        minHeight: "380px",
        flexShrink: 0,
        lineHeight: `${lineHeight}px`, // Apply the same lineHeight
      }}
    >
      {Array.from({ length: lineCount }).map((_, index) => {
        const lineNumber = index + 1;
        const improvementsForLine = errorList
          .filter((error) => error.lineNumber === lineNumber)
          .map((error) => (
            <span
              key={error.id}
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                backgroundColor:
                  localHoveredErrorId === error.id
                    ? theme === "dark"
                      ? "#6BAC68" // Hovered color in dark mode
                      : "yellow"  // Hovered color in light mode
                    : theme === "dark"
                      ? "transparent" // Default color in dark mode
                      : "transparent", // Default color in light mode
              }}
              onMouseEnter={() => {
                hoveredErrorIdRef.current = error.id;
                hoverEventEmitter.emit("hoverChange", error.id);
              }}
              onMouseLeave={() => {
                hoveredErrorIdRef.current = null;
                hoverEventEmitter.emit("hoverChange", null);
              }}
            >
              {error.improvementText}
            </span>
          ));

        return (
          <div key={lineNumber}>
            {improvementsForLine.length > 0 ? (
              improvementsForLine
            ) : (
              <br />
            )}
          </div>
        );
      })}
    </div>
  );
});

Improvements.displayName = "Improvements";
export default Improvements;
