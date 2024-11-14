"use client";
import React, { useEffect, useState } from "react";
import { MDXProvider } from "@mdx-js/react";
import { useParams } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";

function StaticHint() {
  const { pid } = useParams<{ pid: string }>();
  const [content, setContent] = useState("");

  async function compileMDXToComponent(mdxString: string) {
    const file = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypePrettyCode)
      .use(rehypeStringify)
      .process(mdxString);
    return file;
  }

  useEffect(() => {
    const fetchMDX = async () => {
      try {
        const response = await fetch(`/markdown/staticHint/${pid}.mdx`);
        if (!response.ok) throw new Error("MDX file not found");
        const text = await response.text();
        const content = await compileMDXToComponent(text).then((file) =>
          String(file)
        );
        setContent(content);
      } catch (error) {
        setContent("<h1>Problem file not found</h1>");
      }
    };

    fetchMDX();
  }, [pid]);

  return (
    <main>
      <div className="prose prose-invert p-4 sm:p-6 md:p-8 mx-auto relative z-1">
        <article>
          <MDXProvider
            components={{
              h1: (props) => (
                <Heading
                  level={1}
                  className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
                  {...props}
                />
              ),
              h2: (props) => (
                <Heading
                  level={2}
                  className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
                  {...props}
                />
              ),
              h3: (props) => (
                <Heading
                  level={3}
                  className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight"
                  {...props}
                />
              ),
              h4: (props) => (
                <Heading level={4} className="text-base" {...props} />
              ),
              h5: (props) => <Heading level={5} {...props} />,
              h6: (props) => <Heading level={6} {...props} />,
              //   code: (props) => <Code code="`const numbers = [1, 2, 3]{:js}`" />,
              p: (props) => (
                <p
                  className="leading-7 [&:not(:first-child)]:mt-6"
                  {...props}
                ></p>
              ),
              blockquote: (props) => (
                <blockquote
                  className="mt-6 border-l-2 pl-6 italic"
                  {...props}
                ></blockquote>
              ),
              ul: (props) => (
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}></ul>
              ),
            }}
          >
            {<div dangerouslySetInnerHTML={{ __html: content }} />}
          </MDXProvider>
        </article>
      </div>
    </main>
  );
}

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

export default StaticHint;
