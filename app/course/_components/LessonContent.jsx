"use client";
import React, { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/common";

/** Turns a highlight.js language id into something readable for the header. */
const LANGUAGE_LABELS = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  sql: "SQL",
  json: "JSON",
  xml: "HTML",
  html: "HTML",
  css: "CSS",
  bash: "Shell",
  shell: "Shell",
  plaintext: "Code",
};

function labelFor(language) {
  if (!language) return "Code";
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language.toUpperCase();
}

/**
 * Renders a topic's AI-generated HTML and upgrades every code block in it:
 * syntax highlighting, a language label and a copy button.
 *
 * The content arrives as an HTML string, so the enhancement is done against the
 * rendered DOM rather than in JSX. React owns this subtree only through
 * dangerouslySetInnerHTML and never re-renders into it, so the nodes added here
 * are safe until the html prop changes, at which point the whole subtree is
 * replaced and rebuilt.
 */
function LessonContent({ html }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const cleanups = [];

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.dataset.enhanced === "true") return;

      // Prefer the inner <code>, but some generated blocks are a bare <pre>.
      const codeEl = pre.querySelector("code") ?? pre;
      if (!codeEl.textContent?.trim()) return;

      delete codeEl.dataset.highlighted;
      hljs.highlightElement(codeEl);

      // highlightElement sets the detected language when none was declared.
      const declared = [...codeEl.classList].find((c) => c.startsWith("language-"));
      const language = declared
        ? declared.replace("language-", "")
        : codeEl.dataset.highlightedLanguage ?? codeEl.result?.language;

      // Wrap the block so the header and the code scroll as one unit.
      const wrapper = document.createElement("div");
      wrapper.className = "code-block";

      const header = document.createElement("div");
      header.className = "code-block__header";

      const label = document.createElement("span");
      label.className = "code-block__lang";
      label.textContent = labelFor(language);

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-block__copy";
      copyButton.textContent = "Copy";

      let resetTimer;
      const onCopy = async () => {
        try {
          await navigator.clipboard.writeText(codeEl.textContent ?? "");
          copyButton.textContent = "Copied";
        } catch {
          copyButton.textContent = "Press Ctrl+C";
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1600);
      };

      copyButton.addEventListener("click", onCopy);
      cleanups.push(() => {
        copyButton.removeEventListener("click", onCopy);
        clearTimeout(resetTimer);
      });

      header.append(label, copyButton);

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.append(header, pre);
      pre.dataset.enhanced = "true";
    });

    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="lesson-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default LessonContent;
