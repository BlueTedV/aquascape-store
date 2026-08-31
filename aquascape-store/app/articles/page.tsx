"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Search,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  Headphones,
  X,
  CheckCircle2,
  Tag,
  Share2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArticleItem, ARTICLE_CATEGORIES, getArticles } from "@/lib/api/articles";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

function ArticlesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialQuery = searchParams.get("q") || "";

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getArticles({ query: searchQuery, category: selectedCategory })
      .then((data) => {
        if (mounted) {
          setArticles(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [searchQuery, selectedCategory]);

  // Open specific article if slug query param exists
  useEffect(() => {
    const slug = searchParams.get("slug");
    if (slug && articles.length > 0) {
      const match = articles.find((a) => a.slug === slug);
      if (match) setActiveArticle(match);
    }
  }, [searchParams, articles]);

  const featuredArticles = useMemo(() => {
    return articles.filter((a) => a.featured);
  }, [articles]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
          {/* Hero Banner */}
          <section className="py-10 text-center md:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen size={28} />
            </div>
            <span className="mt-4 block font-sans text-xs font-bold uppercase tracking-wider text-tertiary">
              Knowledge Base &amp; Guides
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              Aquaku Help Articles &amp; Documentation
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-on-surface-variant md:text-base">
              Explore our curated library of plant health guides, water cycling tutorials, shipping policies, and equipment walkthroughs.
            </p>

            {/* Search input */}
            <div className="relative mx-auto mt-8 max-w-xl">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search all articles by title, topic, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-outline-variant/60 bg-white py-3.5 pl-11 pr-10 text-sm text-on-surface placeholder:text-gray-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-outline-variant"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 rounded-full p-1 text-gray-400 hover:bg-surface-container hover:text-on-surface"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {ARTICLE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "border border-outline-variant/50 bg-white text-on-surface-variant hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Featured Highlight (if no specific search query is typed) */}
          {!searchQuery && selectedCategory === "All" && featuredArticles.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-primary" />
                <h2 className="font-display text-xl font-bold text-on-surface">
                  Featured Articles
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-primary/20 bg-gradient-to-b from-emerald-50/40 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                          {art.category}
                        </span>
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {art.readTime}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                        {art.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-on-surface-variant">
                        {art.summary}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-outline-variant/30 pt-3 text-xs font-bold text-primary">
                      <span>Read Full Guide</span>
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Articles Grid */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/40 pb-3">
              <h2 className="font-display text-xl font-bold text-on-surface">
                {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`}
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                {articles.length} article{articles.length === 1 ? "" : "s"} found
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-on-surface-variant">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-3 text-xs">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="py-20 text-center text-on-surface-variant rounded-2xl bg-white p-8 border border-outline-variant/30">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-base font-bold text-on-surface">No articles found</h3>
                <p className="mt-1 text-xs text-on-surface-variant">
                  We couldn&apos;t find any articles matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="rounded-lg bg-surface-container px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-high"
                  >
                    Clear Filters
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-container"
                  >
                    <Headphones size={13} /> Ask Support Team
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
                          {art.category}
                        </span>
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {art.readTime}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                        {art.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-on-surface-variant">
                        {art.summary}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {art.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-surface-container-low px-1.5 py-0.5 text-[10px] text-on-surface-variant"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 text-xs font-bold text-primary">
                        <span>Read Article</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bottom Help Banner */}
          <section className="mt-16 rounded-3xl bg-surface-container-low p-8 text-center sm:p-12 border border-outline-variant/40">
            <h2 className="font-display text-2xl font-bold text-on-surface">
              Can&apos;t find what you are looking for?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-on-surface-variant sm:text-sm">
              Our aquascaping specialists are available for live consultation on plant care, hardscape design, and order inquiries.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-container"
              >
                <Headphones size={15} />
                <span>Contact Support Team</span>
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-6 py-3 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container"
              >
                <BookOpen size={15} />
                <span>Step-by-Step Setup Guide</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* ARTICLE FULL MODAL */}
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
                  <Link
                    href="/contact"
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-container"
                  >
                    Contact Support
                  </Link>
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

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-32 text-center text-xs">Loading Knowledge Base...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}
