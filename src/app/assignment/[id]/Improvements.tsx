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
    offsetTop?: number;
    height?: number;
  }>;
  hoveredErrorIdRef: React.MutableRefObject<string | null>;
  hoverEventEmitter: EventEmitter;
  editorContentHeight: number;
}

const Improvements = forwardRef((props: ImprovementsProps, ref) => {
  const {
    errorList,
    hoveredErrorIdRef,
    hoverEventEmitter,
    editorContentHeight,
  } = props;
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [editorContentHeight]);

  return (
    <div
      ref={containerRef}
      className="improvements-content"
      style={{
        boxSizing: "border-box",
        position: "relative",
        border: "1px solid #ccc",
        padding: "10px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        overflowY: "auto",
        maxHeight: "380px",
        minHeight: "380px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          height: `${editorContentHeight}px`,
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
              height: error.height,
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
                backgroundColor:
                  localHoveredErrorId === error.id
                    ? theme === "dark"
                      ? "#6BAC68"
                      : "yellow"
                    : "transparent",
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
