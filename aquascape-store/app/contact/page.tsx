"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ExternalLink,
  BookOpen,
  X,
  Sparkles,
  FileText,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArticleItem, getArticles } from "@/lib/api/articles";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

const faqs = [
  {
    q: "How do you ship live plants safely?",
    a: "All live plants are insulated in specialized temperature-controlled, moisture-sealed packaging with oxygenated packs to ensure they arrive fresh, hydrated, and vibrant regardless of transit weather.",
  },
  {
    q: "What is your live arrival guarantee?",
    a: "We guarantee 100% live arrival for all plants, livestock, and organisms. If any item arrives damaged or dead, simply snap a photo within 2 hours of delivery for an immediate free replacement or refund.",
  },
  {
    q: "Do you offer custom aquascape builds?",
    a: "Yes! Our master aquascapers create custom tailored layouts, hardscapes, and planted ecosystems for homes, offices, and studios. Contact us with your space requirements to get started.",
  },
  {
    q: "What are your standard delivery timeframes?",
    a: "Standard livestock orders are dispatched within 24 hours via express couriers. Live plants and fauna are never held in transit over weekends to guarantee peak freshness.",
  },
  {
    q: "Can I get advice on choosing substrate and lighting?",
    a: "Absolutely! Reach out via live chat or message us with your tank dimensions, and our team will recommend the optimal soil depth, PAR lighting spectrum, and CO2 dosage.",
  },
];

const topics = [
  "Select a topic",
  "Live Plants & Guarantee",
  "Hardscape & Stone Inquiries",
  "Order Status & Tracking",
  "Custom Aquascape Builds",
  "Equipment & Lighting Support",
  "Returns & Refunds",
  "Other Inquiries",
];

const quickTopics = [
  { label: "📦 Live Plant Shipping", query: "shipping" },
  { label: "🛡️ Live Arrival Guarantee", query: "guarantee" },
  { label: "🌱 Nitrogen Cycling", query: "cycling" },
  { label: "💡 CO2 & Lighting", query: "co2" },
  { label: "🌿 Custom Builds", query: "custom" },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch articles on search query change with slight debounce
  useEffect(() => {
    let active = true;
    setLoadingArticles(true);

    const timer = setTimeout(() => {
      getArticles({ query: searchQuery })
        .then((data) => {
          if (active) {
            setArticles(data);
            setLoadingArticles(false);
          }
        })
        .catch(() => {
          if (active) setLoadingArticles(false);
        });
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Click outside search container to close results dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredFaqs = faqs.filter(
    (faq) =>
      !searchQuery.trim() ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="py-8 text-center md:py-12">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              How can we help you?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant/80 sm:text-base">
              Search our knowledge base or reach out to our team of aquascaping experts.
            </p>

            {/* Search Bar & Dropdown Results */}
            <div ref={searchContainerRef} className="relative mx-auto mt-6 max-w-xl">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  className="w-full rounded-full border border-outline-variant/60 bg-white py-3 pl-11 pr-10 text-sm text-on-surface placeholder:text-gray-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-outline-variant"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchFocused(false);
                    }}
                    className="absolute right-3.5 rounded-full p-1 text-gray-400 hover:bg-surface-container hover:text-on-surface"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Quick Topic Chips & Browse All Button */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {quickTopics.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => {
                      setSearchQuery(topic.query);
                      setSearchFocused(true);
                    }}
                    className="rounded-full border border-outline-variant/40 bg-white/80 px-3 py-1 text-[11px] font-semibold text-on-surface-variant transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {topic.label}
                  </button>
                ))}

                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <BookOpen size={12} />
                  <span>Browse All Articles</span>
                  <ArrowRight size={11} />
                </Link>
              </div>

              {/* Dynamic Search Results Dropdown */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-outline-variant/50 bg-white p-3 text-left shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-primary" />
                      Help Articles ({articles.length})
                    </span>
                    {loadingArticles && <Loader2 size={12} className="animate-spin text-primary" />}
                  </div>

                  {articles.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-on-surface-variant">
                      No specific help articles matched &ldquo;{searchQuery}&rdquo;.
                      <p className="mt-1 text-[11px] text-gray-400">
                        You can send us a message below or browse all articles.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {articles.slice(0, 4).map((article) => (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => {
                            setActiveArticle(article);
                            setSearchFocused(false);
                          }}
                          className="flex w-full flex-col rounded-xl p-2.5 text-left transition-colors hover:bg-surface-container-low group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-xs font-bold text-on-surface group-hover:text-primary">
                              {article.title}
                            </span>
                            <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              {article.category}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-[11px] text-on-surface-variant">
                            {article.summary}
                          </p>
                          <span className="mt-1 text-[10px] text-gray-400">
                            {article.readTime} · By {article.author}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 border-t border-outline-variant/30 pt-2 px-2">
                    <Link
                      href={`/articles?q=${encodeURIComponent(searchQuery)}`}
                      className="flex items-center justify-between text-xs font-bold text-primary hover:underline"
                    >
                      <span>View all articles in Knowledge Base</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Contact Channels Grid */}
          <section className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {/* Email Support */}
            <div className="flex flex-col items-center rounded-2xl border border-outline-variant/30 bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-on-surface">
                Email Support
              </h3>
              <p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-on-surface-variant">
                For general inquiries and detailed assistance.
              </p>
              <a
                href="mailto:support@aquakushop.com"
                className="mt-3 font-semibold text-xs text-primary hover:underline"
              >
                support@aquakushop.com
              </a>
              <button
                type="button"
                onClick={handleScrollToForm}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-container"
              >
                Send Message
              </button>
            </div>

            {/* Phone Support */}
            <div className="flex flex-col items-center rounded-2xl border border-outline-variant/30 bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-on-surface">
                Phone Support
              </h3>
              <p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-on-surface-variant">
                Mon-Fri: 9am - 6pm PST
                <br />
                Sat: 10am - 4pm EST
              </p>
              <a
                href="tel:18005551234"
                className="mt-3 font-display text-base font-extrabold text-primary hover:underline"
              >
                1-800-555-1234
              </a>
              <span className="mt-1 text-[11px] text-gray-400">
                Standard rates may apply
              </span>
            </div>

            {/* Live Chat */}
            <div className="flex flex-col items-center rounded-2xl border border-outline-variant/30 bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover sm:col-span-2 md:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-on-surface">
                Live Chat
              </h3>
              <p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-on-surface-variant">
                Chat with a plant health or hardscape expert.
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Experts Online Now
                </span>
              </div>
              <a
                href="https://wa.me/18005551234"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-primary px-5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
              >
                Start Chat
              </a>
            </div>
          </section>

          {/* Form + FAQ Section */}
          <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr]">
            {/* Left: Send us a message */}
            <div
              ref={formRef}
              className="rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-soft sm:p-8"
            >
              <h2 className="font-display text-xl font-bold text-on-surface sm:text-2xl">
                Send us a message
              </h2>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-on-surface">
                    Message Sent Successfully!
                  </h3>
                  <p className="mt-2 max-w-sm text-xs leading-relaxed text-on-surface-variant">
                    Thank you for contacting us. One of our aquascaping specialists will reply to{" "}
                    <strong className="text-on-surface">{formData.email || "your email"}</strong> within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", topic: "", message: "" });
                    }}
                    className="mt-6 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-container"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1.5 w-full rounded-lg bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1.5 w-full rounded-lg bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                      Subject
                    </label>
                    <select
                      required
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="mt-1.5 w-full rounded-lg bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary"
                    >
                      {topics.map((t, idx) => (
                        <option key={t} value={idx === 0 ? "" : t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we help?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-1.5 w-full resize-y rounded-lg bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-container disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Frequently Asked & Browse Articles Links */}
            <div className="flex flex-col justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 p-6 shadow-soft sm:p-8">
              <div>
                <h2 className="font-display text-lg font-bold text-on-surface sm:text-xl">
                  Frequently Asked
                </h2>

                <div className="mt-5 space-y-3">
                  {filteredFaqs.length === 0 && articles.length === 0 ? (
                    <p className="py-6 text-center text-xs text-on-surface-variant">
                      No matching FAQs found for &ldquo;{searchQuery}&rdquo;.
                    </p>
                  ) : (
                    filteredFaqs.slice(0, 3).map((faq, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={faq.q}
                          className="overflow-hidden rounded-xl border border-outline-variant/40 bg-white/90 transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low/60"
                          >
                            <span>{faq.q}</span>
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="border-t border-outline-variant/30 bg-surface-container-low/30 px-4 py-3 text-xs leading-relaxed text-on-surface-variant">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Dedicated Navigation Buttons to Articles & Guides */}
              <div className="mt-6 space-y-2 border-t border-outline-variant/30 pt-4">
                <Link
                  href="/articles"
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white group"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={16} className="text-primary group-hover:text-white" />
                    <span>Browse All Knowledge Base Articles</span>
                  </span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="flex items-center justify-between pt-1 px-1">
                  <Link
                    href="/guides"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant hover:text-primary"
                  >
                    <span>View Step-by-Step Setup Guides</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Visit the Gallery Section */}
          <section className="mt-10 overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Map Illustration matching mockup */}
              <div className="relative flex min-h-[260px] w-full items-center justify-center overflow-hidden bg-[#eef4f0] p-4 sm:min-h-[300px]">
                {/* SVG Stylized Map */}
                <svg
                  className="absolute inset-0 h-full w-full object-cover"
                  viewBox="0 0 500 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Background Land */}
                  <rect width="500" height="320" fill="#f2f5f1" />

                  {/* Parks / Green Zones */}
                  <path
                    d="M30 40 Q80 20 130 50 L110 110 Q50 120 20 80 Z"
                    fill="#ddecd8"
                    opacity="0.8"
                  />
                  <path
                    d="M380 20 Q440 10 480 60 L450 140 Q400 130 360 80 Z"
                    fill="#ddecd8"
                    opacity="0.8"
                  />
                  <path
                    d="M20 220 Q70 200 110 240 L80 300 Q30 310 10 270 Z"
                    fill="#ddecd8"
                    opacity="0.7"
                  />
                  <path
                    d="M340 240 Q400 210 470 250 L460 310 Q390 320 330 280 Z"
                    fill="#ddecd8"
                    opacity="0.7"
                  />

                  {/* Road Network Grid */}
                  <path
                    d="M0 80 L500 90 M0 170 L500 165 M0 250 L500 245"
                    stroke="#ffffff"
                    strokeWidth="8"
                  />
                  <path
                    d="M80 0 L90 320 M200 0 L195 320 M320 0 L315 320 M420 0 L425 320"
                    stroke="#ffffff"
                    strokeWidth="8"
                  />

                  {/* Secondary Streets */}
                  <path
                    d="M0 125 L500 125 M0 210 L500 205 M140 0 L140 320 M260 0 L260 320 M370 0 L370 320"
                    stroke="#ffffff"
                    strokeWidth="4"
                  />

                  {/* River Flow with Curved Path */}
                  <path
                    d="M-20 260 C80 240, 140 200, 240 160 C340 120, 420 80, 520 70 L530 110 C430 120, 350 160, 250 200 C150 240, 90 280, -20 300 Z"
                    fill="#b9e1ef"
                  />
                  <path
                    d="M-20 270 C80 250, 140 210, 240 170 C340 130, 420 90, 520 80"
                    stroke="#9ad2e6"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    fill="none"
                  />

                  {/* Bridges */}
                  <rect
                    x="192"
                    y="170"
                    width="12"
                    height="24"
                    fill="#ffffff"
                    stroke="#d1dcd4"
                    strokeWidth="1"
                    rx="2"
                    transform="rotate(-25 192 170)"
                  />
                  <rect
                    x="312"
                    y="120"
                    width="12"
                    height="24"
                    fill="#ffffff"
                    stroke="#d1dcd4"
                    strokeWidth="1"
                    rx="2"
                    transform="rotate(-25 312 120)"
                  />
                </svg>

                {/* Pin + Tooltip Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Tooltip Card */}
                  <a
                    href="https://maps.google.com/?q=123+Verdant+Way,+Suite+A,+Portland,+OR+97201"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-lg bg-[#1a1c1c] px-3.5 py-2 text-center text-white shadow-xl transition-transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-primary-fixed">
                        Aqua Studio Flagship
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 text-gray-400 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] text-gray-300 leading-tight">
                      123 Verdant Way, Suite A
                    </span>
                    <span className="text-[9px] text-gray-400">
                      Portland, OR 97201
                    </span>
                    {/* Tooltip Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#1a1c1c]" />
                  </a>

                  {/* Pin Dot / Icon */}
                  <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white">
                    <MapPin className="h-4 w-4 fill-white" />
                  </div>
                </div>
              </div>

              {/* Right: Visit the Gallery Info */}
              <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  Visit the Gallery
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-on-surface-variant sm:text-sm">
                  Experience our curated selection of nature aquascapes and speak with our designers in person.
                </p>

                <div className="mt-6 space-y-4 text-xs sm:text-sm">
                  {/* Flagship Location */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">
                        Aqua Studio Flagship
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">
                        123 Verdant Way, Suite A
                        <br />
                        Portland, OR 97201
                      </p>
                    </div>
                  </div>

                  {/* Gallery Hours */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">
                        Gallery Hours
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">
                        Tuesday - Sunday: 11am - 7pm
                        <br />
                        <span className="text-gray-500">
                          Monday: Closed for Maintenance
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-surface-container hover:text-on-surface"
            >
              <X size={20} />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-gray-400">· {activeArticle.readTime}</span>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-on-surface">
                {activeArticle.title}
              </h2>

              <p className="border-l-2 border-primary pl-3.5 text-xs italic font-medium leading-relaxed text-on-surface-variant">
                {activeArticle.summary}
              </p>

              <div className="border-t border-outline-variant/40" />

              {/* Formatted Markdown Article Content */}
              <div className="text-xs leading-relaxed text-on-surface-variant">
                <MarkdownRenderer content={activeArticle.content} />
              </div>

              {/* Footer resolution box */}
              <div className="mt-8 rounded-xl bg-surface-container-low p-4 text-center">
                <p className="text-xs font-semibold text-on-surface">
                  Did this article solve your issue?
                </p>
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  If you still need assistance, our support team is available Mon-Fri.
                </p>
                <div className="mt-3 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="rounded-lg bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    Yes, thank you!
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveArticle(null);
                      handleScrollToForm();
                    }}
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-container"
                  >
                    Send Us a Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
