import { useTheme } from "next-themes";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EventEmitter } from "./EventEmitter";
import type { PositionedTextError } from "./utils";

interface ImprovementsProps {
  errorList: PositionedTextError[];
  hoveredErrorIdRef: React.MutableRefObject<string | null>;
  hoverEventEmitter: EventEmitter;
}

const Improvements = forwardRef((props: ImprovementsProps, ref) => {
  const { errorList, hoveredErrorIdRef, hoverEventEmitter } = props;
  const { theme } = useTheme();
  const [localHoveredErrorId, setLocalHoveredErrorId] = useState<string | null>(
    null
  );
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
      className="improvements-content"
      style={{
        boxSizing: "border-box",
        position: "relative",
        padding: "10px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        overflowY: "auto",
        flexShrink: 0,
        flex: "1",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
        }}
      >
        {errorList.map((error) => (
          <div
            key={error.id}
            style={{
              position: "absolute",
              top: error.offsetTop,
              left: 0,
              right: 0,
              zIndex: localHoveredErrorId === error.id ? 2 : 0,
              opacity: localHoveredErrorId === error.id ? 1 : 0.8,
              border: "solid 1px #444",
              borderRadius: 8,
              padding: 8,
              backgroundColor:
                localHoveredErrorId === error.id
                  ? theme === "dark"
                    ? "#6BAC68"
                    : "yellow"
                  : theme === "dark"
                  ? "#2D2D2D"
                  : "#F9F9F9",
              overflow: "hidden",
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
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "13px",

                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {error.improvementText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

Improvements.displayName = "Improvements";
export default Improvements;
