import React from "react";
import { diffChars } from "diff";

type HighlightedDiffProps = {
  output: string;
  expectedOutput: string;
  addedHidden?: boolean;
  removedHidden?: boolean;
};

const HighlightedDiff: React.FC<HighlightedDiffProps> = ({
  output,
  expectedOutput,
  addedHidden, // 綠色不顯示
  removedHidden, // 紅色不顯示
}) => {
  if (!output) return <p>{output}</p>;
  const diff = diffChars(output, expectedOutput);
  // console.log(JSON.stringify(diff, null, 2));

  const result = diff.map((part, index) => {
    if (part.added) {
      return (
        <span
          key={index}
          className={`bg-green-600 w-fit  whitespace-pre-wrap
          ${addedHidden ? "hidden" : ""} `}
        >
          {part.value}
        </span>
      );
    } else if (part.removed) {
      return (
        <span
          key={index}
          className={`bg-red-600 w-fit  whitespace-pre-wrap  ${removedHidden ? "hidden" : ""}`}
        >
          {part.value}
        </span>
      );
    } else {
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.value}
        </span>
      );
    }
  });

  return <div>{result}</div>;
};

export default HighlightedDiff;
