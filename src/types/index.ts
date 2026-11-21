export type { Session, User } from "next-auth";

export interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "USER" | "ADMIN";
  credits: number;
  plan: "FREE" | "PRO" | "ENTERPRISE";
}

export type ToolType =
  | "BLOG_GENERATOR"
  | "INSTAGRAM_CAPTION"
  | "PRODUCT_DESCRIPTION"
  | "YOUTUBE_DESCRIPTION"
  | "YOUTUBE_SCRIPT"
  | "CODE_ASSISTANT";

export interface GeneratedContent {
  id: string;
  userId: string;
  toolType: ToolType;
  title: string;
  input: Record<string, unknown>;
  output: string;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  price: number;
  currency: string;
  credits: number;
  features: string[];
  isPopular: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BlogInput {
  topic: string;
  tone: string;
  length: string;
  language: string;
}

export interface CaptionInput {
  topic: string;
  tone: string;
  audience?: string;
  count: number;
}

export interface ProductInput {
  productName: string;
  features: string;
  audience: string;
  tone: string;
}

export interface YoutubeDescInput {
  title: string;
  topic: string;
  audience: string;
  tone: string;
}

export interface YoutubeScriptInput {
  title: string;
  topic: string;
  videoType: string;
  tone: string;
  length: string;
}

export interface CodeInput {
  problem: string;
  language: string;
  complexity?: string;
}
