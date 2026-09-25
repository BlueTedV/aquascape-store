"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Tag,
  Clock,
  User,
  ExternalLink,
  Layers,
  Check,
  FileText,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import {
  ArticleItem,
  ArticleAdminInput,
  ARTICLE_CATEGORIES,
  getAdminArticles,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
} from "@/lib/api/articles";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ManageArticlesView() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [form, setForm] = useState<ArticleAdminInput>({
    title: "",
    slug: "",
    category: "Shipping & Guarantee",
    summary: "",
    content: "",
    tags: [],
    author: "Aquaku Specialist",
    readTime: "3 min read",
    isPublished: true,
    featured: false,
  });
  const [rawTags, setRawTags] = useState("");

  // Preview Modal
  const [previewArticle, setPreviewArticle] = useState<ArticleItem | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<ArticleItem | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getAdminArticles();
      setArticles(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load help articles.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesSearch =
        !searchQuery.trim() ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === "All" || art.category === selectedCategory;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && art.isPublished) ||
        (statusFilter === "draft" && !art.isPublished);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [articles, searchQuery, selectedCategory, statusFilter]);

  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.isPublished).length;
    const drafts = total - published;
    const categoriesCount = new Set(articles.map((a) => a.category)).size;
    return { total, published, drafts, categoriesCount };
  }, [articles]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      category: "Shipping & Guarantee",
      summary: "",
      content: "",
      tags: [],
      author: "Aquaku Specialist",
      readTime: "3 min read",
      isPublished: true,
      featured: false,
    });
    setRawTags("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (art: ArticleItem) => {
    setEditingId(art.id);
    setForm({
      title: art.title,
      slug: art.slug,
      category: art.category,
      summary: art.summary,
      content: art.content,
      tags: art.tags,
      author: art.author,
      readTime: art.readTime,
      isPublished: art.isPublished,
      featured: art.featured,
    });
    setRawTags(art.tags.join(", "));
    setIsEditorOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      // Auto update slug if slug was empty or auto-derived
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return {
        ...prev,
        title: val,
        slug: editingId ? prev.slug : autoSlug,
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setErrorMsg("Please fill out Title, Summary, and Article Content.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const parsedTags = rawTags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);

    const payload: ArticleAdminInput = {
      ...form,
      tags: parsedTags,
    };

    try {
      if (editingId) {
        const updated = await updateAdminArticle(editingId, payload);
        setArticles((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
        setSuccessMsg(`Article "${updated.title}" updated successfully!`);
      } else {
        const created = await createAdminArticle(payload);
        setArticles((prev) => [created, ...prev]);
        setSuccessMsg(`Article "${created.title}" published successfully!`);
      }
      setIsEditorOpen(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save article.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (art: ArticleItem) => {
    setArticleToDelete(art);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    const art = articleToDelete;
    setDeletingId(art.id);
    setErrorMsg("");

    try {
      await deleteAdminArticle(art.id);
      setArticles((prev) => prev.filter((a) => a.id !== art.id));
      setSuccessMsg(`Article "${art.title}" deleted.`);
      setArticleToDelete(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete article.";
      setErrorMsg(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (art: ArticleItem) => {
    try {
      const updated = await updateAdminArticle(art.id, {
        ...art,
        isPublished: !art.isPublished,
      });
      setArticles((prev) => prev.map((a) => (a.id === art.id ? updated : a)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-container p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold">
            <BookOpen size={24} />
            <h2 className="font-display text-headline-md font-bold text-on-surface">
              Help Articles &amp; Knowledge Base
            </h2>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Create and maintain help guides, tutorials, and policy articles accessible from the customer Help Center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/articles"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/60 bg-white px-4 py-2.5 text-xs font-bold text-on-surface shadow-sm transition-all hover:bg-surface-container hover:text-primary"
          >
            <ExternalLink size={14} />
            <span>View Live Articles Page</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-container hover:shadow-md"
          >
            <Plus size={16} />
            <span>Create New Article</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-500/10 p-4 text-sm font-semibold text-rose-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-outline-variant/50 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Total Articles
          </span>
          <div className="mt-1 text-2xl font-extrabold text-on-surface">{stats.total}</div>
        </div>

        <div className="rounded-xl border border-outline-variant/50 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Published
          </span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-700">{stats.published}</div>
        </div>

        <div className="rounded-xl border border-outline-variant/50 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Drafts
          </span>
          <div className="mt-1 text-2xl font-extrabold text-amber-700">{stats.drafts}</div>
        </div>

        <div className="rounded-xl border border-outline-variant/50 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
            Categories
          </span>
          <div className="mt-1 text-2xl font-extrabold text-tertiary">{stats.categoriesCount}</div>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-outline-variant/40">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles by title, topic, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/60 bg-surface-container-low py-2 pl-10 pr-4 text-xs text-on-surface placeholder:text-gray-400 outline-none focus:bg-white focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
          >
            {ARTICLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
            className="rounded-lg border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
          >
            <option value="all">Status: All</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Articles List / Table */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white shadow-sm">
        {loading ? (
          <div className="divide-y divide-outline-variant/30 p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between pt-3 first:pt-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-3.5 w-96 max-w-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm font-semibold text-on-surface">No articles found</p>
            <p className="text-xs text-on-surface-variant">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search filters or create a new article."
                : "Get started by publishing your first help article."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-container"
            >
              <Plus size={14} /> Create Article
            </button>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-surface-container-low/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {art.category}
                    </span>

                    {art.isPublished ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check size={10} /> Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        Draft
                      </span>
                    )}

                    {art.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <Sparkles size={10} /> Featured
                      </span>
                    )}

                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {art.readTime}
                    </span>
                  </div>

                  <h4 className="font-display text-base font-bold text-on-surface">
                    {art.title}
                  </h4>

                  <p className="line-clamp-2 text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {art.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-surface-container-low px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant"
                      >
                        #{tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-gray-400 ml-2">By {art.author}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewArticle(art)}
                    className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
                    title="Preview Article"
                  >
                    <Eye size={14} /> Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(art)}
                    className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
                    title="Edit Article"
                  >
                    <Edit size={14} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePublish(art)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      art.isPublished
                        ? "text-amber-700 hover:bg-amber-50"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {art.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === art.id}
                    onClick={() => handleDelete(art)}
                    className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    title="Delete Article"
                  >
                    {deletingId === art.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <BookOpen size={20} />
                <h3 className="font-display text-lg font-bold text-on-surface">
                  {editingId ? "Edit Help Article" : "Create New Help Article"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-surface-container hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Title & Slug */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How We Pack & Ship Live Plants Safely"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-xs font-semibold text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
                  >
                    {ARTICLE_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Read Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 min read"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Short Summary / Search Snippet *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="A concise 1-2 sentence overview shown in help search results and article cards..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Full Article Content with Markdown Editor Toolbar */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Article Body (Markdown Supported) *
                  </label>
                  <span className="text-[10px] text-gray-400">Use the toolbar buttons or type markdown directly</span>
                </div>
                <MarkdownEditor
                  value={form.content}
                  onChange={(content) => setForm({ ...form, content })}
                  rows={9}
                  placeholder="## Section Heading&#10;Write the detailed explanation, instructions, or steps here...&#10;&#10;- Bullet point one&#10;- Bullet point two&#10;&#10;> Important note or tips"
                />
              </div>

              {/* Tags & Author */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Search Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="shipping, live-plants, guarantee, cycling"
                    value={rawTags}
                    onChange={(e) => setRawTags(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Author Attribution
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Scaper Andra / Aquaku Support"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-xs text-on-surface outline-none focus:bg-white focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 rounded-xl bg-surface-container-low p-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                  <span>Publish Immediately (Visible in Help Search)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                  <span>Feature Article at Top</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-container disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingId ? "Save Changes" : "Create Article"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARTICLE PREVIEW MODAL */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewArticle(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-surface-container hover:text-on-surface"
            >
              <X size={20} />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {previewArticle.category}
                </span>
                <span className="text-xs text-gray-400">· {previewArticle.readTime}</span>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-on-surface">
                {previewArticle.title}
              </h2>

              <p className="text-sm font-medium text-on-surface-variant/90 border-l-2 border-primary pl-3 italic">
                {previewArticle.summary}
              </p>

              <div className="my-4 border-t border-outline-variant/40" />

              {/* Rendered Markdown content */}
              <div className="text-xs text-on-surface-variant leading-relaxed">
                <MarkdownRenderer content={previewArticle.content} />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/40 pt-4 text-xs text-gray-400">
                <span>Author: {previewArticle.author}</span>
                <div className="flex gap-1">
                  {previewArticle.tags.map((t) => (
                    <span key={t} className="rounded bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={confirmDeleteArticle}
        title="Delete Article"
        message={
          <span>
            Are you sure you want to permanently delete <strong>&quot;{articleToDelete?.title}&quot;</strong>? This action cannot be undone.
          </span>
        }
        confirmText="Delete Article"
        variant="danger"
        isLoading={!!deletingId}
      />
    </div>
  );
}
