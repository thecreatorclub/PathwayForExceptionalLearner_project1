import { Descendant, Node, Text } from "slate";
// utils.ts

export type TextError = {
  id: string;
  originalText: string;
  improvementText: string;
};

export type PositionedTextError = TextError & {
  offsetTop: number;
  height: number; // Store the height of the corresponding text block
};

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractFeedback(feedback: string, editorValue: Descendant[]) {
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
  return {
    errors: processStudentWriting(editorValue, replacements),
    message: cleanMessage(feedback),
  };
}

function cleanMessage(message: string) {
  return message
    .split("\n")
    .filter(
      (line) =>
        !line.match(/\*\*Original Text:\*\*/) &&
        !line.match(/\*\*Improvement:\*\*/)
    )
    .join("\n");
}

let uid = 0;

function processStudentWriting(
  editorValue: Descendant[],
  replacements: { originalText: string; improvementText: string }[]
) {
  let errors: TextError[] = [];

  replacements = replacements.flatMap((r) =>
    r.originalText.indexOf("...") === -1
      ? r
      : [r, { ...r, originalText: r.originalText.replace("...", "") }]
  );

  for (const [node] of Node.nodes({ children: editorValue })) {
    if (Text.isText(node)) {
      const text = node.text;

      let errorIndex = 0;
      for (const { originalText, improvementText } of replacements) {
        const regex = new RegExp(escapeRegExp(originalText), "gi");
        let match;
        let occurrenceIndex = 0;

        while ((match = regex.exec(text)) !== null) {
          const errorId = "te_" + uid++;

          console.log("Found match:", {
            errorId,
            originalText,
            matchIndex: match.index,
          });

          errors.push({
            id: errorId,
            originalText,
            improvementText,
          });
          occurrenceIndex++;
        }
      }

      errorIndex++;
    }
  }

  console.log("Error List after processing student writing:", errors);

  return errors;
  // setErrorList(errors);
  // setErrorsUpdated(true); // Set the flag to true
}

// finds the position of text in a rich text editor
export function findRichTextPixelPosition(
  container: HTMLElement,
  searchText: string
) {
  const range = document.createRange();
  let currentText = "";
  let startNode: HTMLElement | null = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;
  let matched = false;

  // Recursive function to traverse and find the range
  function traverse(node: HTMLElement) {
    if (node.nodeType === window.Node.TEXT_NODE) {
      const text = node.textContent || "";
      const combinedText = currentText + text;

      // Check if the searchText starts or ends in this node
      const startIndex = combinedText.indexOf(searchText);
      if (startIndex !== -1) {
        matched = true;
        if (!startNode) {
          startNode = node;
          startOffset = startIndex - currentText.length;
        }
        const endIndex = startIndex + searchText.length - currentText.length;
        if (endIndex <= text.length) {
          endNode = node;
          endOffset = endIndex;
          return true; // Stop traversal once the full text is matched
        }
      }
      currentText += text; // Update cumulative text
    } else if (node.nodeType === window.Node.ELEMENT_NODE) {
      for (const child of node.childNodes) {
        if (traverse(child as HTMLElement)) {
          return true;
        }
      }
    }
    return false;
  }

  traverse(container);

  if (!matched || !startNode || !endNode) {
    return null; // Text not found
  }

  // Set the range to the matched text
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  // Get the bounding rectangle for the range
  const rect = range.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Calculate position relative to the container
  const top = rect.top - containerRect.top;
  const left = rect.left - containerRect.left;

  return {
    top,
    left,
    width: rect.width,
    height: rect.height,
  };
}
