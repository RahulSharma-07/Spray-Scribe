export const BLOG_PROMPT = (
  topic: string,
  tone: string,
  length: string,
  language: string
) => `You are an expert blog writer. Write a comprehensive, engaging blog post.

Topic: ${topic}
Tone: ${tone}
Length: ${length === "short" ? "400-600 words" : length === "medium" ? "800-1200 words" : "1500-2000 words"}
Language: ${language}

Requirements:
- Start with a compelling title (H1)
- Write an engaging introduction
- Use H2/H3 subheadings to structure content
- Include practical insights and examples
- End with a strong conclusion and call-to-action
- Format using Markdown
- Match the specified tone throughout

Output only the blog post in Markdown format.`;

export const INSTAGRAM_CAPTION_PROMPT = (
  topic: string,
  tone: string,
  audience: string,
  count: number
) => `You are an expert Instagram content creator. Generate ${count} unique Instagram caption(s).

Topic/Idea: ${topic}
Tone: ${tone}
Target Audience: ${audience || "General"}

Requirements:
- Each caption should be engaging and authentic
- Include relevant emojis
- Add 5-10 trending hashtags per caption
- Keep captions concise but impactful
- Match the specified tone
- Separate each caption clearly with "---"

Output ${count} caption(s) with hashtags.`;

export const PRODUCT_DESCRIPTION_PROMPT = (
  productName: string,
  features: string,
  audience: string,
  tone: string
) => `You are an expert e-commerce copywriter. Write a compelling product description.

Product Name: ${productName}
Key Features: ${features}
Target Audience: ${audience}
Tone: ${tone}

Requirements:
- Start with an attention-grabbing headline
- Write a compelling 2-3 sentence overview
- List key features as bullet points (use ✓ checkmarks)
- Include a persuasive call-to-action
- Highlight benefits, not just features
- Keep it scannable and conversion-focused

Format the output clearly with sections.`;

export const YOUTUBE_DESCRIPTION_PROMPT = (
  title: string,
  topic: string,
  audience: string,
  tone: string,
  descLength: string = "standard"
) => {
  const config =
    descLength === "short" ? {
      minWords: 180, maxWords: 240,
      paragraphs: "3",
      label: "180–240 words (Short ~1500 chars)",
    } :
    descLength === "detailed" ? {
      minWords: 600, maxWords: 750,
      paragraphs: "8–9",
      label: "600–750 words (Detailed ~5000 chars)",
    } : {
      minWords: 380, maxWords: 450,
      paragraphs: "5–6",
      label: "380–450 words (Standard ~3000 chars)",
    };

  // Extract the primary keyword — first 3 meaningful words of the title
  const primaryKeyword = title.trim();

  return `You are a YouTube SEO expert. Your output will be graded by VidIQ and TubeBuddy. Follow every rule exactly to achieve a 70+ SEO score.

Video Title: ${title}
Topic: ${topic}
Target Audience: ${audience || "General viewers"}
Tone: ${tone}

════════════════════════════════════
SECTION 1 — 📌 HOOK (first 150 characters of the description)
════════════════════════════════════
CRITICAL: The very first sentence of this hook MUST contain the exact phrase or close variation of: "${primaryKeyword}"
YouTube and VidIQ score the first 150 characters for keyword presence — this is the highest-weighted SEO factor.

Write exactly 3 lines:
Line 1 (most important): Start with or immediately include "${primaryKeyword}" — make it the first 10 words
Line 2: State the single biggest benefit the viewer will get from watching
Line 3: A compelling reason to watch right now

════════════════════════════════════
SECTION 2 — 📺 DESCRIPTION BODY (${config.minWords}–${config.maxWords} words ONLY)
════════════════════════════════════
Write exactly ${config.paragraphs} paragraphs of 3–5 sentences each.
Hard limit: STOP at ${config.maxWords} words. Do NOT exceed ${config.maxWords} words.

SEO requirements (each one increases the VidIQ score):
- Paragraph 1: Restate "${primaryKeyword}" naturally within the first 2 sentences — this reinforces keyword signals
- Paragraph 2–${config.paragraphs === "3" ? "2" : config.paragraphs}: Cover key aspects of "${topic}" — use related keyword phrases like "how to ${topic}", "best ${topic} tips", "complete guide to ${topic}"
- Mid-body: Include exactly this line: "Drop a comment below and let me know your thoughts — I read every single one."
- Use natural long-tail keyword phrases in every paragraph (3–5 word phrases related to the topic)
- Tone: ${tone}
- Final paragraph: "If you found this helpful, hit the Subscribe button and ring the 🔔 bell so you never miss a video. Give this video a 👍 like — it really helps the channel grow!"

════════════════════════════════════
SECTION 3 — ⏱️ TIMESTAMPS
════════════════════════════════════
Write exactly 8 timestamps. Timestamps signal chapter structure to YouTube which boosts search visibility.
0:00 - Introduction
[7 more realistic chapters for "${topic}"]

════════════════════════════════════
SECTION 4 — 🔗 LINKS & RESOURCES
════════════════════════════════════
🔔 Subscribe: [YOUR CHANNEL LINK]
📱 Instagram: [LINK]
🐦 Twitter / X: [LINK]
💬 Community: [DISCORD/FACEBOOK LINK]
📧 Business Enquiries: [EMAIL]
🛒 Merch / Products: [LINK]
📚 Free Resources: [LINK]

════════════════════════════════════
SECTION 5 — 🏷️ SEO TAGS
════════════════════════════════════
Write exactly 30 tags on ONE comma-separated line.
IMPORTANT for high SEO score: At least 8 tags must contain words from the title "${title}".
Mix:
- 8 short-tail (1–2 words, include the main topic word)
- 14 long-tail (3–6 words, include "how to", "best", "tips", "guide" variations)
- 8 question-based (how/what/why/when + topic)
No generic tags like "video", "youtube", "watch".

════════════════════════════════════
SECTION 6 — #️⃣ HASHTAGS
════════════════════════════════════
Write exactly 15 hashtags on ONE line. (YouTube displays best with 3–15 hashtags — more can hurt ranking.)
First 3 = broad high-traffic. Next 8 = niche for "${topic}". Last 4 = medium-reach.
No spaces within hashtags. Each starts with #.

════════════════════════════════════
RULES
════════════════════════════════════
1. Sections in order: 1 → 2 → 3 → 4 → 5 → 6
2. Section 1: First sentence MUST contain "${primaryKeyword}"
3. Section 2: ${config.minWords}–${config.maxWords} words — hard stop at ${config.maxWords}
4. Section 3: exactly 8 timestamps
5. Section 5: exactly 30 tags, one line
6. Section 6: exactly 15 hashtags, one line
7. No commentary outside sections
8. Start immediately with "SECTION 1 — 📌 HOOK"`;
};

export const YOUTUBE_SCRIPT_PROMPT = (
  title: string,
  topic: string,
  videoType: string,
  tone: string,
  length: string
) => `You are an expert YouTube scriptwriter. Write a viral-ready YouTube script.

Video Title: ${title}
Topic: ${topic}
Video Type: ${videoType}
Tone: ${tone}
Length: ${length === "short" ? "3-5 minutes" : length === "medium" ? "8-12 minutes" : "15-20 minutes"}

Structure the script with these EXACT sections:

## 🎣 HOOK (First 15 seconds)
[Write an attention-grabbing opening statement]

## 📖 INTRO
[Introduce yourself and what viewers will learn]

## 📚 MAIN CONTENT
[Main educational/entertaining content with clear structure]

## 💬 ENGAGEMENT PROMPTS
[2-3 questions or prompts to boost engagement]

## 📣 CALL TO ACTION
[Clear CTA for subscription, likes, comments]

## 👋 OUTRO
[Wrap up and tease next video]

Make it conversational, engaging, and suitable for the specified tone.`;

export const CODE_ASSISTANT_PROMPT = (
  problem: string,
  language: string,
  complexity: string
) => `You are an expert software engineer and code mentor. Help solve the following coding problem.

Problem/Question: ${problem}
Programming Language: ${language}
Complexity Level: ${complexity || "intermediate"}

Provide:

## 💻 CODE SOLUTION
\`\`\`${language.toLowerCase()}
// Your clean, well-commented code here
\`\`\`

## 📖 EXPLANATION
Explain what the code does step by step, in simple terms.

## ⚡ KEY CONCEPTS
List 3-5 key concepts or techniques used.

## 🔧 OPTIMIZATION TIPS
Suggest any improvements or alternative approaches.

Make the code clean, readable, and production-quality.`;
