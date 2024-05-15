import React from "react";
import { diffWords, diffLines } from "diff";

type HighlightedDiffProps = {
  output: string;
  expectedOutput: string;
  addedHidden?: boolean;
  removedHidden?: boolean;
  diffMode?: string;
};

const HighlightedDiff: React.FC<HighlightedDiffProps> = ({
  output,
  expectedOutput,
  addedHidden,
  removedHidden,
  diffMode = "word",
}) => {
  let diff;
  if (diffMode === "line") {
    diff = diffLines(output, expectedOutput);
  } else {
    diff = diffWords(output, expectedOutput);
  }

  const result = diff.map((part, index) => {
    if (part.added) {
      return (
        // <span
        //   key={index}
        //   className={`bg-green-600  ${addedHidden ? "hidden" : ""}`}
        // >
        //   {part.value}
        // </span>
        <div
          key={index}
          className={`bg-green-600 w-fit 
          ${addedHidden ? "hidden" : ""} 
          ${diffMode === "line" ? "block" : "inline-block"}`}
          dangerouslySetInnerHTML={{
            __html: part.value.replace(/\n/g, "<br>"),
          }}
        ></div>
      );
    } else if (part.removed) {
      return (
        // <span
        //   key={index}
        //   className={`bg-red-600  ${removedHidden ? "hidden" : ""}`}
        // >
        //   {part.value}
        // </span>
        <div
          key={index}
          className={`bg-red-600 w-fit inline-block ${
            removedHidden ? "hidden" : ""
          }`}
          dangerouslySetInnerHTML={{
            __html: part.value.replace(/\n/g, "<br>"),
          }}
        ></div>
      );
    } else {
      return (
        <div
          key={index}
          className={`${diffMode === "line" ? "block" : "inline-block"}`}
          dangerouslySetInnerHTML={{
            __html: part.value.replace(/\n/g, "<br>"),
          }}
        ></div>
      );
    }
  });

  return <div>{result}</div>;
};

export default HighlightedDiff;
