"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Plus,
  Sparkles,
  X,
  Upload,
  CheckCircle2,
  Lock,
  MessageSquare,
  Flame,
  Clock,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionReveal from "@/components/ui/SectionReveal";
import { GalleryPost } from "@/lib/types";
import { getGalleryPosts, createGalleryPost, likeGalleryPost } from "@/lib/api/gallery";
import { getStoredSession } from "@/lib/api/auth";

export default function CommunityPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [sort, setSort] = useState<"top" | "latest">("top");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    tankSpecs: "",
    image: "",
    size: "wide" as "tall" | "wide" | "square",
  });

  useEffect(() => {
    const session = getStoredSession();
    setIsLoggedIn(Boolean(session?.accessToken));

    setLoading(true);
    getGalleryPosts({ sort, limit: 24 })
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, [sort]);

  const handleLike = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isCurrentlyLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likesCount: isCurrentlyLiked ? p.likesCount - 1 : p.likesCount + 1,
          };
        }
        return p;
      }),
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: isCurrentlyLiked ? prev.likesCount - 1 : prev.likesCount + 1,
            }
          : null,
      );
    }

    const session = getStoredSession();
    await likeGalleryPost(postId, session?.accessToken);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image.trim()) return;

    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const session = getStoredSession();
      const newPost = await createGalleryPost(form, session?.accessToken);
      setPosts((prev) => [newPost, ...prev]);
      setSuccessMsg("Your aquascape has been published to the community hub!");
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccessMsg("");
        setErrorMsg("");
        setForm({ title: "", description: "", tankSpecs: "", image: "", size: "wide" });
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save post to database.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Header */}
        <section className="bg-surface-container-low py-16 md:py-20">
          <div className="mx-auto max-w-container px-edge-margin-mobile text-center md:px-edge-margin-desktop">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles size={32} />
            </div>
            <span className="mt-4 block font-sans text-label-md uppercase tracking-wider text-tertiary">
              Aquaku Community Hub
            </span>
            <h1 className="mt-2 font-display text-display-md font-bold text-primary md:text-display-lg">
              Share Your Underwater Creations
            </h1>
            <p className="mx-auto mt-3 max-w-2xl font-sans text-body-md text-on-surface-variant md:text-body-lg">
              Connect with fellow aquascapers across Indonesia. Post your tank setups, vote for your favorite layouts, and discover inspiring designs.
            </p>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-sans font-medium text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:scale-105"
              >
                <Plus size={20} />
                <span>Share Your Aquascape</span>
              </button>
            </div>
          </div>
        </section>

        {/* Sort & Filter Bar */}
        <SectionReveal as="section" className="py-8">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSort("top")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-sans text-body-md font-medium transition-all ${
                    sort === "top"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <Flame size={18} />
                  <span>Most Liked</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSort("latest")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-sans text-body-md font-medium transition-all ${
                    sort === "latest"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <Clock size={18} />
                  <span>Most Recent</span>
                </button>
              </div>

              <div className="font-sans text-body-md text-on-surface-variant">
                Showing <span className="font-bold text-on-surface">{posts.length}</span> community tanks
              </div>
            </div>

            {/* Masonry Post Grid */}
            {loading ? (
              <div className="py-20 text-center font-sans text-body-lg text-on-surface-variant">
                Loading community showcase...
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center font-sans text-body-lg text-on-surface-variant">
                No community posts yet. Be the first to share your aquascape!
              </div>
            ) : (
              <div className="mt-8 columns-1 gap-gutter sm:columns-2 lg:columns-3">
                {posts.map((item) => {
                  const sizeKey = item.size ?? "wide";
                  const aspect =
                    sizeKey === "tall"
                      ? "aspect-[4/5]"
                      : sizeKey === "square"
                      ? "aspect-square"
                      : "aspect-[4/3]";
                  const isLiked = likedPosts[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedPost(item)}
                      className={`group relative mb-gutter break-inside-avoid overflow-hidden rounded-xl shadow-soft transition-all duration-300 hover:shadow-xl cursor-pointer ${aspect}`}
                    >
                      <Image
                        src={item.image}
                        alt={item.title || "Aquascape photography"}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Right Heart Badge */}
                      <div className="absolute right-3 top-3 z-10">
                        <button
                          type="button"
                          onClick={(e) => handleLike(item.id, e)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md transition-all ${
                            isLiked
                              ? "bg-rose-500 text-white shadow-md"
                              : "bg-black/50 text-white hover:bg-black/70"
                          }`}
                        >
                          <Heart size={14} className={isLiked ? "fill-white" : ""} />
                          <span>{item.likesCount}</span>
                        </button>
                      </div>

                      {/* Bottom Info Gradient */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white">
                        <h3 className="font-sans font-bold text-title-md text-white line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="font-sans text-xs text-white/80 mt-0.5">
                          by {item.authorName}
                        </p>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                        <span className="rounded-full bg-white/90 px-5 py-2 font-sans text-label-md font-semibold text-primary shadow-lg backdrop-blur-md">
                          View Tank Specs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionReveal>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-surface-container-low shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
                <div className="relative min-h-[320px] bg-black md:min-h-[480px]">
                  <Image
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    fill
                    sizes="(min-width: 768px) 380px, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Community Showcase
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLike(selectedPost.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                          likedPosts[selectedPost.id]
                            ? "bg-rose-500 text-white"
                            : "bg-surface-container-high text-on-surface hover:bg-rose-100"
                        }`}
                      >
                        <Heart
                          size={15}
                          className={likedPosts[selectedPost.id] ? "fill-white" : ""}
                        />
                        <span>{selectedPost.likesCount} Hearts</span>
                      </button>
                    </div>

                    <h2 className="mt-4 font-display text-headline-md font-bold text-on-surface">
                      {selectedPost.title}
                    </h2>
                    <p className="font-sans text-body-md font-semibold text-tertiary">
                      Created by {selectedPost.authorName}
                    </p>

                    {selectedPost.description && (
                      <p className="mt-4 font-sans text-body-md text-on-surface-variant leading-relaxed">
                        {selectedPost.description}
                      </p>
                    )}

                    {selectedPost.tankSpecs && (
                      <div className="mt-4 rounded-xl bg-background-white p-4 border border-outline-variant">
                        <div className="text-xs font-bold uppercase tracking-wider text-tertiary">
                          Equipment &amp; Tank Specifications
                        </div>
                        <div className="mt-1 font-sans text-body-md text-on-surface font-medium">
                          {selectedPost.tankSpecs}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-outline-variant pt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedPost(null)}
                      className="rounded-md bg-surface-container px-5 py-2 font-sans text-body-md font-semibold text-on-surface hover:bg-surface-container-high"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-surface-container-low p-6 shadow-2xl md:p-8">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles size={22} />
                <span className="font-display text-title-lg">Post Your Aquascape</span>
              </div>
              <p className="mt-1 font-sans text-body-md text-on-surface-variant">
                Share your aquarium creation with thousands of aquascapers in Indonesia.
              </p>

              {!isLoggedIn ? (
                <div className="mt-6 rounded-xl bg-surface-container-high p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Lock size={24} />
                  </div>
                  <h3 className="mt-3 font-sans text-title-md font-bold text-on-surface">
                    Login Required to Post
                  </h3>
                  <p className="mt-1 font-sans text-body-md text-on-surface-variant">
                    Please log in or create an account to share your tank creations and receive community hearts!
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/login"
                      className="rounded-md bg-primary px-6 py-2.5 font-sans font-medium text-on-primary hover:bg-primary-hover"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md border border-outline px-6 py-2.5 font-sans font-medium text-on-surface hover:bg-surface-container"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : successMsg ? (
                <div className="my-8 rounded-xl bg-emerald-500/10 p-6 text-center text-emerald-800">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                  <p className="mt-2 font-sans font-bold text-body-lg">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleCreateSubmit} className="mt-6 space-y-4">
                  {errorMsg && (
                    <div className="rounded-xl bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 border border-rose-200">
                      {errorMsg}
                    </div>
                  )}
                  <div>
                    <label className="block font-sans text-label-md font-semibold text-on-surface">
                      Aquascape Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. 60P Dutch Garden Symphony"
                      className="mt-1 w-full rounded-md border border-outline-variant bg-background-white px-4 py-2.5 font-sans text-body-md text-on-surface outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-label-md font-semibold text-on-surface">
                      Aquascape Photo *
                    </label>

                    {form.image ? (
                      <div className="relative mt-2 h-48 w-full overflow-hidden rounded-xl border border-outline-variant bg-black group">
                        <Image src={form.image} alt="Upload Preview" fill sizes="(min-width: 640px) 540px, 100vw" className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-3">
                          <label className="cursor-pointer rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-primary backdrop-blur-md hover:bg-white">
                            <span>Change Photo</span>
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
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image: "" })}
                            className="rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                          Live Preview
                        </span>
                      </div>
                    ) : (
                      <label className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-surface-container">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Upload size={22} />
                        </div>
                        <span className="mt-3 font-sans text-body-md font-bold text-on-surface">
                          Click or drag photo to upload
                        </span>
                        <span className="mt-1 font-sans text-xs text-on-surface-variant">
                          PNG, JPG, WEBP or SVG (Max 5MB)
                        </span>
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


                  <div>
                    <label className="block font-sans text-label-md font-semibold text-on-surface">
                      Tank Specifications &amp; Equipment
                    </label>
                    <input
                      type="text"
                      value={form.tankSpecs}
                      onChange={(e) => setForm({ ...form, tankSpecs: e.target.value })}
                      placeholder="e.g. 60x30x36cm Rimless | RGB Light | Pressurized CO2"
                      className="mt-1 w-full rounded-md border border-outline-variant bg-background-white px-4 py-2.5 font-sans text-body-md text-on-surface outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-label-md font-semibold text-on-surface">
                      Story &amp; Plant/Hardscape Notes
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe your plant species, stone types, and maintenance routine..."
                      className="mt-1 w-full rounded-md border border-outline-variant bg-background-white px-4 py-2.5 font-sans text-body-md text-on-surface outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-md border border-outline px-5 py-2.5 font-sans font-medium text-on-surface hover:bg-surface-container"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-md bg-primary px-6 py-2.5 font-sans font-medium text-on-primary shadow-sm hover:bg-primary-hover disabled:opacity-50"
                    >
                      {submitting ? "Publishing..." : "Publish Post"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
