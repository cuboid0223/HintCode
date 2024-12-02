import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRecoilValue } from "recoil";
import { problemDataState } from "@/atoms/ProblemData";
import { Badge } from "@/components/ui/badge";
import { EASY, HARD, MEDIUM } from "@/utils/const";
import { useEffect, useRef, useState } from "react";
import { Difficulty } from "@/types/problem";
import { showWarningToast } from "@/utils/Toast/message";

const DescriptionTab = () => {
  const problem = useRecoilValue(problemDataState);
  const [showOverlay, setShowOverlay] = useState(false);
  const ref = useRef(null); // Update this if ref is really needed
  const { resolvedTheme } = useTheme();

  const handleBadgeColor = (difficulty: Difficulty) => {
    switch (difficulty.trim()) {
      case EASY:
        return "bg-green-500";
      case MEDIUM:
        return "bg-yellow-500";
      case HARD:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    // 禁止右鍵
    const handleContextMenu = (event) => {
      event.preventDefault();
      showWarningToast("右鍵功能已被禁用！");
    };

    const disablePrintScreen = async (event) => {
      if (event.key === "Meta") {
        // windows + shift = Meta
        try {
          event.preventDefault();
          setShowOverlay(true);
          await navigator.clipboard.writeText("");
        } catch (error) {
          console.error("無法寫入剪貼簿：", error);
        }
      }
    };

    const disablePrtSc = (event) => {
      if (event.key === "PrintScreen") {
        setShowOverlay(true);
      }
    };

    // const disableDevTools = (event) => {
    //   if (
    //     (event.ctrlKey || event.metaKey) &&
    //     event.shiftKey &&
    //     event.key === "I" // 禁止 Ctrl+Shift+I
    //   ) {
    //     event.preventDefault();
    //     showWarningToast("開發者工具已被禁用！");
    //   }

    //   if (event.key === "F12") {
    //     // 禁止 F12
    //     event.preventDefault();
    //     showWarningToast("開發者工具已被禁用！");
    //   }
    // };

    // 添加事件監聽
    document.addEventListener("contextmenu", handleContextMenu, {
      passive: true,
    });
    document.addEventListener("keydown", disablePrintScreen, { passive: true });
    // document.addEventListener("keydown", disableDevTools);

    document.addEventListener("keyup", disablePrtSc, { passive: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", disablePrintScreen);
      document.removeEventListener("keyup", disablePrtSc);
      // document.removeEventListener("keydown", disableDevTools);
    };
  }, []);

  return (
    <div className="flex px-5 py-4 overflow-y-auto">
      <div className="flex-1 relative">
        {/* 截圖防範 模糊題目敘述 */}
        {showOverlay && (
          <div className="absolute z-10 top-0 bottom-0 left-0 right-0 flex items-center justify-center backdrop-blur-lg rounded-md">
            <h2>請重整頁面</h2>
          </div>
        )}

        {/* Problem heading */}
        <div
          className="w-full "
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <h1 className="mr-2 text-lg font-medium">{problem?.title}</h1>
          <Badge className={`my-2 ${handleBadgeColor(problem?.difficulty)}`}>
            {problem?.difficulty}
          </Badge>
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // markdown components integrated with shadcn UI
              h3({ className, ...rest }) {
                return (
                  <h3
                    className="scroll-m-20 text-2xl font-semibold tracking-tight"
                    {...rest}
                  ></h3>
                );
              },
              ul({ className, ...rest }) {
                return (
                  <ul
                    className="my-6 ml-6 list-disc [&>li]:mt-2"
                    {...rest}
                  ></ul>
                );
              },
              table({ className, ...rest }) {
                return <table className="w-full mb-6" {...rest}></table>;
              },
              tr({ className, ...rest }) {
                return (
                  <tr className="m-0 border-t p-0 even:bg-muted" {...rest}></tr>
                );
              },
              th({ className, ...rest }) {
                return (
                  <th
                    className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></th>
                );
              },
              td({ className, ...rest }) {
                return (
                  <td
                    className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...rest}
                  ></td>
                );
              },
              blockquote({ className, ...rest }) {
                return (
                  <blockquote
                    className="mb-3 border-l-4 p-3 pl-6 bg-gray-300 dark:bg-gray-400 rounded-md border-gray-400 dark:border-gray-300 text-gray-600"
                    {...rest}
                  ></blockquote>
                );
              },
              hr({ className, ...rest }) {
                return (
                  <hr
                    className="my-3 border-gray-400 dark:border-gray-300 border-1"
                    {...rest}
                  ></hr>
                );
              },
              code({ children, className, node, ...rest }) {
                return (
                  <SyntaxHighlighter
                    PreTag="code"
                    customStyle={{ padding: "0.25rem" }}
                    style={resolvedTheme === "dark" ? a11yDark : docco}
                    language="python"
                  >
                    {String(children).trim()}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {problem.problemStatement}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default DescriptionTab;
