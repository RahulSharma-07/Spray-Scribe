import Link from "next/link";
import { Zap, Twitter, Github, Linkedin, Mail, Youtube, Instagram } from "lucide-react";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Home",              href: "/" },
      { label: "Features",          href: "/features" },
      { label: "Pricing",           href: "/pricing" },
      { label: "All AI Tools",      href: "/tools/all" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Blog Generator",         href: "/tools/blog-generator" },
      { label: "Instagram Captions",     href: "/tools/instagram-caption" },
      { label: "YouTube Description",    href: "/tools/youtube-description" },
      { label: "YouTube Script",         href: "/tools/youtube-script" },
      { label: "Product Description",    href: "/tools/product-description" },
      { label: "Code Assistant",         href: "/tools/code-assistant" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign Up Free",   href: "/signup" },
      { label: "Sign In",        href: "/login" },
      { label: "Dashboard",      href: "/dashboard" },
      { label: "Content Library",href: "/library" },
      { label: "Settings",       href: "/settings" },
      { label: "Upgrade Plan",   href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",         href: "/about" },
      { label: "Contact Us",       href: "/support" },
      { label: "Help & Support",   href: "/support" },
      { label: "API Reference",    href: "#" },
      { label: "Status",           href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy",        href: "/privacy" },
      { label: "Terms of Service",      href: "/terms" },
      { label: "Cookie Policy",         href: "/cookies" },
      { label: "Refund Policy",         href: "/refunds" },
      { label: "Acceptable Use Policy", href: "/acceptable-use" },
      { label: "GDPR",                  href: "/gdpr" },
    ],
  },
];

const socials = [
  { icon: Twitter,   href: "#",                           label: "Twitter / X" },
  { icon: Youtube,   href: "#",                           label: "YouTube" },
  { icon: Instagram, href: "#",                           label: "Instagram" },
  { icon: Github,    href: "#",                           label: "GitHub" },
  { icon: Mail,      href: "mailto:hello@sprayscribe.com",label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/06 bg-[#070807]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="py-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10">

          {/* Brand col — takes 1 col on lg */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-base gradient-text-brand">Spray Scribe</span>
            </Link>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 max-w-[200px]">
              AI content tools for creators, marketers, and developers.
            </p>
            {/* Socials */}
            <div className="flex flex-wrap gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg glass border border-white/08 flex items-center justify-center text-stone-500 hover:text-teal-400 hover:border-teal-500/30 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-500 hover:text-stone-200 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/06" />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-600">
            © {new Date().getFullYear()} Spray Scribe. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms" },
              { label: "Cookies", href: "/cookies" },
              { label: "Refunds", href: "/refunds" },
              { label: "Contact", href: "/support" },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-xs text-stone-600 hover:text-stone-300 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-stone-700">
            Made with ☕ &amp; AI
          </p>
        </div>

      </div>
    </footer>
  );
}
