import React, { Suspense } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeShiki from "@shikijs/rehype";
import { MDXProvider } from "@mdx-js/react";
import Index from "../../../../public/markdown/staticHint/calculate_bmi.mdx";

// export async function Code({ code }: { code: string }) {
//   const highlightedCode = await highlightCode(code);
//   return (
//     <section
//       dangerouslySetInnerHTML={{
//         __html: highlightedCode,
//       }}
//     />
//   );
// }

// async function highlightCode(code: string) {
//   const file = await unified()
//     .use(remarkParse)
//     .use(remarkRehype)
//     .use(rehypePrettyCode, {
//       keepBackground: false,
//     })
//     .use(rehypeShiki, {
//       // or `theme` for a single theme
//       themes: {
//         light: "rose-pine-dawn",
//         dark: "material-theme",
//       },
//     })
//     .use(rehypeStringify)
//     .process(code);

//   return String(file);
// }

function Heading({
  level,
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const tag = `h${level}`;
  return React.createElement(tag, props, <p>{children}</p>);
}
function StaticHint() {
  return (
    <main>
      <div className="prose prose-invert p-4 sm:p-6 md:p-8 mx-auto relative z-1">
        <article>
          <MDXProvider
            components={{
              h1: (props) => (
                <Heading level={1} className="text-2xl" {...props} />
              ),
              h2: (props) => (
                <Heading level={2} className="text-xl" {...props} />
              ),
              h3: (props) => (
                <Heading level={3} className="text-lg" {...props} />
              ),
              h4: (props) => (
                <Heading level={4} className="text-base" {...props} />
              ),
              h5: (props) => <Heading level={5} {...props} />,
              h6: (props) => <Heading level={6} {...props} />,
              //   code: (props) => <Code code="`const numbers = [1, 2, 3]{:js}`" />,
            }}
          >
            <Index />
          </MDXProvider>
        </article>
      </div>
    </main>
  );
}

export default StaticHint;
