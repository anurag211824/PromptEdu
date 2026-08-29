"use client";
import React, { useContext, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
// PrismLight + explicit language registration. The full `Prism` build bundles
// every language it supports and added ~280kB to this route.
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";

// Registered under their aliases too, since fences use whichever the model picks.
const LANGUAGES = {
  javascript, js: javascript, jsx, typescript, ts: typescript, tsx: jsx,
  java, python, py: python, bash, sh: bash, shell: bash,
  sql, json, markup, html: markup, xml: markup, css,
  cpp, "c++": cpp, csharp, "c#": csharp, go,
};

Object.entries(LANGUAGES).forEach(([name, definition]) => {
  SyntaxHighlighter.registerLanguage(name, definition);
});
import { Check, Copy } from "lucide-react";
import { ThemeContext } from "@/contexts/ThemeContext";

/** Readable label for a fenced block's language. */
const LANGUAGE_LABELS = {
  js: "JavaScript",
  jsx: "JSX",
  javascript: "JavaScript",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",
  java: "Java",
  cs: "C#",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rs: "Rust",
  rust: "Rust",
  php: "PHP",
  rb: "Ruby",
  ruby: "Ruby",
  sql: "SQL",
  json: "JSON",
  yaml: "YAML",
  html: "HTML",
  css: "CSS",
  sh: "Shell",
  bash: "Shell",
  shell: "Shell",
};

function labelFor(language) {
  if (!language) return "Code";
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language.toUpperCase();
}

/** A fenced code block: language label, copy button, syntax highlighting. */
function CodeBlock({ language, value, isDark }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the code is still selectable.
    }
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__lang">{labelFor(language)}</span>
        <button type="button" onClick={copy} className="code-block__copy">
          {copied ? (
            <>
              <Check className="inline h-3 w-3" aria-hidden /> Copied
            </>
          ) : (
            <>
              <Copy className="inline h-3 w-3" aria-hidden /> Copy
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language || "text"}
        style={isDark ? oneDark : oneLight}
        // The wrapper already supplies the surface, radius and border.
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "transparent",
          padding: "1em 1.15em",
          fontSize: "0.85rem",
          lineHeight: 1.65,
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-mono), ui-monospace, monospace" },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * Renders a topic's generated lesson.
 *
 * Content is authored as GitHub Flavored Markdown, but courses generated before
 * that change hold raw HTML — `rehype-raw` lets both render through the same
 * pipeline, so older courses keep working without a migration.
 */
function LessonContent({ html }) {
  const { themeMode } = useContext(ThemeContext);
  const isDark = themeMode === "dark";

  const components = useMemo(
    () => ({
      code({ inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        const value = String(children).replace(/\n$/, "");

        // Only fenced blocks become highlighted blocks; short inline spans and
        // untagged single-line snippets stay as inline code.
        if (inline || (!match && !value.includes("\n"))) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }

        return (
          <CodeBlock language={match?.[1]} value={value} isDark={isDark} />
        );
      },
      // `pre` is handled by CodeBlock, so unwrap it to avoid nesting.
      pre({ children }) {
        return <>{children}</>;
      },
      table({ children }) {
        return (
          <div className="lesson-table-wrap">
            <table>{children}</table>
          </div>
        );
      },
      a({ children, ...props }) {
        return (
          <a target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        );
      },
    }),
    [isDark]
  );

  return (
    <div className="lesson-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {html}
      </ReactMarkdown>
    </div>
  );
}

export default LessonContent;
