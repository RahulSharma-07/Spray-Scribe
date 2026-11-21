"use client";

import Link from "next/link";
import { Mail, MessageCircle, BookOpen } from "lucide-react";

const faqs = [
  { q: "How do I get more credits?", a: "You can upgrade your plan on the Pricing page to get more monthly credits, or wait for your credits to reset at the start of your next billing cycle." },
  { q: "Why did my generation fail?", a: "Generation can fail if you have insufficient credits, poor internet connection, or if the AI service is temporarily unavailable. Check your credit balance and try again." },
  { q: "Can I edit generated content?", a: "Yes! You can view generated content in your Content Library and copy it to any editor. Rich text editing options are available in the output panel." },
  { q: "How do I cancel my subscription?", a: "Go to Settings → Subscription and click 'Cancel Subscription'. Your access will continue until the end of the current billing period." },
  { q: "Is my data secure?", a: "Yes. We use industry-standard encryption, HTTP-only cookies, and never sell your data. See our Privacy Policy for full details." },
  { q: "Can I use generated content commercially?", a: "Yes, content you generate is yours to use for personal or commercial purposes. We recommend reviewing AI content before publishing." },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl font-black text-white mb-4">How Can We <span className="gradient-text">Help?</span></h1>
          <p className="text-gray-400 text-xl">Find answers or reach out to our team</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: Mail, title: "Email Support", desc: "Get a response within 24 hours", action: "Send Email", href: "mailto:support@sprayscribe.com", color: "from-blue-500/15 border-blue-500/20" },
            { icon: MessageCircle, title: "Live Chat", desc: "Chat with our team in real-time", action: "Start Chat", href: "#", color: "from-purple-500/15 border-purple-500/20" },
            { icon: BookOpen, title: "Documentation", desc: "Read detailed guides and tutorials", action: "View Docs", href: "#", color: "from-green-500/15 border-green-500/20" },
          ].map((item) => (
            <a key={item.title} href={item.href} className={`block p-6 rounded-2xl bg-gradient-to-br ${item.color} border transition-all hover:-translate-y-1 hover:shadow-lg`}>
              <item.icon className="w-8 h-8 text-white mb-4" />
              <h3 className="font-display font-bold text-white text-lg mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
              <span className="text-sm font-semibold text-blue-400 hover:text-blue-300">{item.action} →</span>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="font-display text-2xl font-black text-white mb-6">Send Us a Message</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent! We'll get back to you soon."); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                <input type="text" placeholder="What can we help you with?" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                <textarea rows={5} placeholder="Tell us more about your issue..." className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm resize-none" />
              </div>
              <button type="submit" className="btn-gradient px-6 py-3 rounded-xl text-white font-semibold text-sm w-full shadow-lg">
                Send Message
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-2xl font-black text-white mb-6">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="p-4 rounded-xl glass border border-white/08 hover:border-white/15 transition-all">
                  <h3 className="font-semibold text-white text-sm mb-1.5">{faq.q}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
