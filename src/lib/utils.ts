import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}

export function downloadAsText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const TOOL_CREDITS: Record<string, number> = {
  BLOG_GENERATOR: 3,
  INSTAGRAM_CAPTION: 1,
  PRODUCT_DESCRIPTION: 2,
  YOUTUBE_DESCRIPTION: 2,
  YOUTUBE_SCRIPT: 4,
  CODE_ASSISTANT: 2,
};

export const TOOL_LABELS: Record<string, string> = {
  BLOG_GENERATOR: "Blog Generator",
  INSTAGRAM_CAPTION: "Instagram Caption",
  PRODUCT_DESCRIPTION: "Product Description",
  YOUTUBE_DESCRIPTION: "YouTube Description",
  YOUTUBE_SCRIPT: "YouTube Script",
  CODE_ASSISTANT: "Code Assistant",
};
