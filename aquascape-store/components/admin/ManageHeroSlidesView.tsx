"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Sparkles, Trash2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { getHeroSlides, createHeroSlide, deleteHeroSlide, HeroSlideItem } from "@/lib/api/hero-slides";

export default function ManageHeroSlidesView() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    eyebrow: "Special Offer",
    title: "",
    body: "",
    cta: "Shop Now",
    filter: "all",
    image: "",
  });

  const loadSlides = async () => {
    setLoading(true);
    try {
      const data = await getHeroSlides();
      setSlides(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load hero slides.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim() || !form.image.trim()) {
      setErrorMsg("Please fill out title, description, and provide a banner photo.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const newSlide = await createHeroSlide(form);
      setSlides((prev) => [...prev, newSlide]);
      setSuccessMsg("Hero slide created successfully!");
      setForm({
        eyebrow: "Special Offer",
        title: "",
        body: "",
        cta: "Shop Now",
        filter: "all",
        image: "",
      });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create hero slide.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this hero slide?")) return;

    setDeletingId(id);
    try {
      await deleteHeroSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      setSuccessMsg("Hero slide removed.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete slide.";
      setErrorMsg(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-surface-container p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Sparkles size={22} />
            <h2 className="font-display text-headline-md font-bold text-on-surface">Manage Shop Hero Slides</h2>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Create, manage, or remove promotional banners displayed at the top of the Shop Catalog page.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm font-semibold text-rose-700 border border-rose-200">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Create Form + Existing Slides List */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Create Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCreate} className="rounded-2xl bg-surface-container p-6 shadow-sm space-y-4">
            <h3 className="font-display text-title-lg font-bold text-on-surface border-b border-outline-variant pb-3">
              Add New Hero Slide
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Eyebrow / Badge Text
              </label>
              <input
                type="text"
                required
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                placeholder="e.g. Weekend Sale"
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Main Banner Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Hardscape Bundles up to 25% Off"
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Description Subtext *
              </label>
              <textarea
                rows={2}
                required
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Curated stone and wood packs for nano tanks..."
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  required
                  value={form.cta}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  placeholder="e.g. Shop Sale Items"
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Category / Status Filter
                </label>
                <select
                  value={form.filter}
                  onChange={(e) => setForm({ ...form, filter: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                >
                  <option value="all">All Products</option>
                  <option value="sale">On Sale</option>
                  <option value="new">New Arrival</option>
                  <option value="available">Available</option>
                  <option value="plants">Plants</option>
                  <option value="hardscape">Hardscape</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Banner Background Photo *
              </label>
              {form.image ? (
                <div className="relative mt-2 h-40 w-full overflow-hidden rounded-xl border border-outline-variant bg-black group">
                  <Image src={form.image} alt="Banner Preview" fill sizes="(min-width: 640px) 400px, 100vw" className="object-cover opacity-80" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="absolute right-2 top-2 rounded bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-4 text-center cursor-pointer hover:border-primary">
                  <Upload size={20} className="text-primary" />
                  <span className="mt-1 text-xs font-bold text-on-surface">Click to upload banner photo</span>
                  <span className="text-[10px] text-on-surface-variant">PNG, JPG, SVG or WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setForm({ ...form, image: String(event.target.result) });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-sans text-sm font-bold text-on-primary shadow-sm hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
              <span>{submitting ? "Creating Slide..." : "Add Hero Slide"}</span>
            </button>
          </form>
        </div>

        {/* Existing Slides List */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-surface-container p-6 shadow-sm space-y-4">
            <h3 className="font-display text-title-lg font-bold text-on-surface border-b border-outline-variant pb-3 flex items-center justify-between">
              <span>Active Hero Slides</span>
              <span className="text-xs font-sans font-normal text-on-surface-variant">
                {slides.length} slide{slides.length === 1 ? "" : "s"}
              </span>
            </h3>

            {loading ? (
              <div className="py-12 text-center text-sm text-on-surface-variant">Loading hero slides...</div>
            ) : slides.length === 0 ? (
              <div className="py-12 text-center text-sm text-on-surface-variant">
                No hero slides created yet. Using default store carousel slides.
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="relative overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                  >
                    <div className="relative h-24 w-full sm:w-40 shrink-0 overflow-hidden rounded-lg bg-black">
                      <Image src={slide.image} alt={slide.title} fill sizes="160px" className="object-cover opacity-80" />
                      <span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-on-primary">
                        {slide.eyebrow}
                      </span>
                    </div>

                    <div className="grow space-y-1">
                      <h4 className="font-display font-bold text-on-surface text-base line-clamp-1">
                        {slide.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{slide.body}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold text-tertiary">
                          CTA: {slide.cta}
                        </span>
                        <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold text-on-surface-variant uppercase">
                          Filter: {slide.filter}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === slide.id}
                      onClick={() => handleDelete(slide.id)}
                      className="shrink-0 rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      title="Remove slide"
                    >
                      {deletingId === slide.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
