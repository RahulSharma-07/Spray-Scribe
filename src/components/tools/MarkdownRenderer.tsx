"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  isCode?: boolean;
}

export function MarkdownRenderer({ content, isCode }: MarkdownRendererProps) {
  // Simple check for code blocks to use highlighter
  if (isCode || content.includes("```")) {
    const parts = content.split(/(```[\s\S]*?```)/);
    
    return (
      <div className="prose-dark space-y-4">
        {parts.map((part, i) => {
          if (part.startsWith("```")) {
            const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
            const lang = match?.[1] || "javascript";
            const code = match?.[2] || part.slice(3, -3);
            
            return (
              <div key={i} className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="bg-white/05 px-4 py-1.5 border-b border-white/08 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lang}</span>
                </div>
                <SyntaxHighlighter
                  language={lang}
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem",
                    fontSize: "0.85rem",
                    lineHeight: "1.6",
                    background: "rgba(0,0,0,0.4)",
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            );
          }
          
          return (
            <div 
              key={i} 
              dangerouslySetInnerHTML={{ __html: simpleMarkdown(part) }} 
            />
          );
        })}
      </div>
    );
  }

  return (
    <div 
      className="prose-dark" 
      dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} 
    />
  );
}

function simpleMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^---$/gm, "<hr>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hup]|<li|<hr|<pre)(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}
