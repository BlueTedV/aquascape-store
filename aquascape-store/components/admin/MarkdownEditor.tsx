"use client";

import { useRef, useState } from "react";
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Minus,
  Eye,
  Edit3,
  Columns,
} from "lucide-react";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  rows = 10,
  placeholder = "Write article content using markdown...",
  className = "",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("write");

  const insertFormatting = (prefix: string, suffix: string = "", placeholderText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholderText;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const newValue = `${before}${prefix}${textToInsert}${suffix}${after}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + textToInsert.length;
      textarea.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 0);
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-outline-variant/60 bg-white ${className}`}>
      {/* Toolbar & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 bg-surface-container-low/60 px-3 py-2">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            title="Heading 2 (##)"
            onClick={() => insertFormatting("## ", "\n", "Heading Title")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
          >
            <Heading2 size={15} />
          </button>

          <button
            type="button"
            title="Heading 3 (###)"
            onClick={() => insertFormatting("### ", "\n", "Subheading Title")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
          >
            <Heading3 size={15} />
          </button>

          <div className="mx-1 h-4 w-[1px] bg-outline-variant/60" />

          <button
            type="button"
            title="Bold (**text**)"
            onClick={() => insertFormatting("**", "**", "bold text")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors font-bold text-xs"
          >
            <Bold size={14} />
          </button>

          <button
            type="button"
            title="Italic (*text*)"
            onClick={() => insertFormatting("*", "*", "italic text")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors italic text-xs"
          >
            <Italic size={14} />
          </button>

          <div className="mx-1 h-4 w-[1px] bg-outline-variant/60" />

          <button
            type="button"
            title="Bullet List (- item)"
            onClick={() => insertFormatting("- ", "\n", "List item")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
          >
            <List size={14} />
          </button>

          <button
            type="button"
            title="Numbered List (1. item)"
            onClick={() => insertFormatting("1. ", "\n", "First item")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
          >
            <ListOrdered size={14} />
          </button>

          <button
            type="button"
            title="Blockquote (> quote)"
            onClick={() => insertFormatting("> ", "\n", "Important note or quote")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
          >
            <Quote size={14} />
          </button>

          <div className="mx-1 h-4 w-[1px] bg-outline-variant/60" />

          <button
            type="button"
            title="Inline Code (`code`)"
            onClick={() => insertFormatting("`", "`", "code")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors font-mono text-[11px]"
          >
            <Code size={14} />
          </button>

          <button
            type="button"
            title="Hyperlink ([text](url))"
            onClick={() => insertFormatting("[", "](https://aquakushop.com)", "link title")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
          >
            <LinkIcon size={14} />
          </button>

          <button
            type="button"
            title="Horizontal Divider (---)"
            onClick={() => insertFormatting("\n---\n", "", "")}
            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
          >
            <Minus size={14} />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-lg bg-surface-container p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode("write")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
              viewMode === "write"
                ? "bg-white text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Edit3 size={12} />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
              viewMode === "preview"
                ? "bg-white text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`hidden sm:flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
              viewMode === "split"
                ? "bg-white text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Columns size={12} />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* Editor Body Area */}
      <div className="relative">
        {viewMode === "write" && (
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white p-3.5 font-mono text-xs leading-relaxed text-on-surface placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary"
          />
        )}

        {viewMode === "preview" && (
          <div className="min-h-[220px] max-h-[400px] overflow-y-auto bg-surface-container-low/30 p-4">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="py-8 text-center text-xs italic text-gray-400">
                Nothing to preview yet. Switch back to Write mode to type markdown content.
              </p>
            )}
          </div>
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-2 divide-x divide-outline-variant/40">
            <textarea
              ref={textareaRef}
              rows={rows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white p-3.5 font-mono text-xs leading-relaxed text-on-surface placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="max-h-[350px] overflow-y-auto bg-surface-container-low/30 p-3.5">
              {value.trim() ? (
                <MarkdownRenderer content={value} />
              ) : (
                <p className="py-8 text-center text-xs italic text-gray-400">
                  Live preview will render here.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Markdown Quick Cheat-sheet footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 bg-surface-container-low/40 px-3 py-1.5 text-[10px] text-gray-400">
        <span>Markdown supported: ## Headings, **bold**, *italic*, - lists, `code`, [links]</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
