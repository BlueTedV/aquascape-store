"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Parses inline formatting like **bold**, *italic*, `code`, [link](url), ~~strike~~
function parseInline(text: string): ReactNode[] {
  const elements: ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      elements.push(
        <code
          key={`code-${keyIdx++}`}
          className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 2. Bold + Italic: ***text*** or ___text___
    const boldItalicMatch = remaining.match(/^(\*\*\*|___)(.+?)\1/);
    if (boldItalicMatch) {
      elements.push(
        <strong key={`bi-${keyIdx++}`} className="font-bold italic text-on-surface">
          {parseInline(boldItalicMatch[2])}
        </strong>
      );
      remaining = remaining.slice(boldItalicMatch[0].length);
      continue;
    }

    // 3. Bold: **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      elements.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-on-surface">
          {parseInline(boldMatch[2])}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 4. Italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)([^*_]+?)\1/);
    if (italicMatch) {
      elements.push(
        <em key={`i-${keyIdx++}`} className="italic text-on-surface-variant">
          {parseInline(italicMatch[2])}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 5. Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      elements.push(
        <del key={`del-${keyIdx++}`} className="line-through text-gray-400">
          {parseInline(strikeMatch[1])}
        </del>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // 6. Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const href = linkMatch[2];
      const isInternal = href.startsWith("/") || href.startsWith("#");
      if (isInternal) {
        elements.push(
          <Link
            key={`link-${keyIdx++}`}
            href={href}
            className="font-bold text-primary underline underline-offset-2 hover:text-primary-container"
          >
            {linkMatch[1]}
          </Link>
        );
      } else {
        elements.push(
          <a
            key={`link-${keyIdx++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary underline underline-offset-2 hover:text-primary-container"
          >
            {linkMatch[1]}
          </a>
        );
      }
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 7. Regular text up to the next special character
    const nextSpecial = remaining.search(/[`*_~\[]/);
    if (nextSpecial === -1) {
      elements.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Special char that didn't match a rule, push char and continue
      elements.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      elements.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return elements;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return null;
  }

  // Normalize line endings
  const normalized = content.replace(/\r\n/g, "\n");
  const rawLines = normalized.split("\n");

  const nodes: ReactNode[] = [];
  let index = 0;
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Code Block (```lang)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.replace("```", "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith("```")) {
        codeLines.push(rawLines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(
        <div
          key={`code-block-${index++}`}
          className="my-3 overflow-hidden rounded-xl border border-outline-variant/60 bg-[#1e2321] text-white"
        >
          {lang && (
            <div className="border-b border-white/10 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {lang}
            </div>
          )}
          <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-emerald-100/90">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 3. Headings
    if (trimmed.startsWith("#### ")) {
      nodes.push(
        <h4
          key={`h4-${index++}`}
          className="mt-4 mb-1.5 font-display text-xs font-bold uppercase tracking-wider text-tertiary"
        >
          {parseInline(trimmed.replace("#### ", ""))}
        </h4>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3
          key={`h3-${index++}`}
          className="mt-5 mb-2 font-display text-sm font-bold text-on-surface sm:text-base"
        >
          {parseInline(trimmed.replace("### ", ""))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2
          key={`h2-${index++}`}
          className="mt-6 mb-2.5 font-display text-base font-bold text-primary sm:text-lg border-b border-outline-variant/30 pb-1.5"
        >
          {parseInline(trimmed.replace("## ", ""))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1
          key={`h1-${index++}`}
          className="mt-6 mb-3 font-display text-lg font-extrabold text-on-surface sm:text-xl"
        >
          {parseInline(trimmed.replace("# ", ""))}
        </h1>
      );
      i++;
      continue;
    }

    // 4. Horizontal Rule (--- or ***)
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      nodes.push(<hr key={`hr-${index++}`} className="my-4 border-t border-outline-variant/50" />);
      i++;
      continue;
    }

    // 5. Blockquote (> text)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith(">")) {
        quoteLines.push(rawLines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      nodes.push(
        <blockquote
          key={`quote-${index++}`}
          className="my-3 rounded-r-xl border-l-4 border-primary bg-emerald-50/60 py-2.5 px-4 text-xs italic leading-relaxed text-on-surface-variant"
        >
          {parseInline(quoteLines.join(" "))}
        </blockquote>
      );
      continue;
    }

    // 6. Unordered List (- or * or +)
    if (/^[-*+]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < rawLines.length && /^[-*+]\s+/.test(rawLines[i].trim())) {
        listItems.push(rawLines[i].trim().replace(/^[-*+]\s+/, ""));
        i++;
      }
      nodes.push(
        <ul key={`ul-${index++}`} className="my-2.5 space-y-1.5 pl-2 text-xs text-on-surface-variant">
          {listItems.map((item, itemIdx) => (
            <li key={`li-${itemIdx}`} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Ordered List (1. 2. 3.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < rawLines.length && /^\d+\.\s+/.test(rawLines[i].trim())) {
        listItems.push(rawLines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${index++}`} className="my-2.5 space-y-1.5 pl-1 text-xs text-on-surface-variant">
          {listItems.map((item, itemIdx) => (
            <li key={`oli-${itemIdx}`} className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-mono text-[10px] font-bold text-emerald-800">
                {itemIdx + 1}
              </span>
              <span className="leading-relaxed">{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Regular Paragraph (group consecutive text lines until empty line or special block)
    const paraLines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() &&
      !rawLines[i].trim().startsWith("#") &&
      !rawLines[i].trim().startsWith("```") &&
      !rawLines[i].trim().startsWith(">") &&
      !/^[-*+]\s+/.test(rawLines[i].trim()) &&
      !/^\d+\.\s+/.test(rawLines[i].trim()) &&
      !/^(\-{3,}|\*{3,})$/.test(rawLines[i].trim())
    ) {
      paraLines.push(rawLines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      nodes.push(
        <p key={`p-${index++}`} className="my-2 text-xs leading-relaxed text-on-surface-variant">
          {parseInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return <div className={`space-y-1 ${className}`}>{nodes}</div>;
}
