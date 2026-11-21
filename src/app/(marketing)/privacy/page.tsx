import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy — Spray Scribe" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-black text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        {[
          { title: "1. Information We Collect", content: "We collect information you provide directly to us, such as your name, email address, and payment information when you create an account or upgrade your plan. We also collect usage data including content you generate and actions you take on the platform." },
          { title: "2. How We Use Your Information", content: "We use your information to provide, maintain, and improve our services, process transactions, send transactional emails, and communicate with you about updates or offers. We never sell your personal data to third parties." },
          { title: "3. Data Storage & Security", content: "Your data is stored securely on servers hosted by Vercel and PostgreSQL. We implement industry-standard encryption for data in transit (TLS/SSL) and at rest. API keys and passwords are hashed using bcrypt." },
          { title: "4. AI Content Generation", content: "Content you submit to our AI tools is sent to OpenAI's API for processing. We do not store your input prompts beyond what is necessary to provide the service. OpenAI's data usage policies apply to AI generation requests." },
          { title: "5. Cookies", content: "We use HTTP-only session cookies for authentication (managed by NextAuth). We do not use tracking or advertising cookies." },
          { title: "6. Your Rights", content: "You may request deletion of your account and all associated data at any time by contacting us at privacy@sprayscribe.com. You can also export your saved content from the Content Library." },
          { title: "7. Contact Us", content: "If you have questions about this Privacy Policy, please contact us at privacy@sprayscribe.com." },
        ].map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="font-display font-bold text-xl text-white mb-3">{section.title}</h2>
            <p className="text-gray-400 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
