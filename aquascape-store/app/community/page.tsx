"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Plus,
  Sparkles,
  X,
  Upload,
  CheckCircle2,
  Lock,
  Flame,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionReveal from "@/components/ui/SectionReveal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Skeleton from "@/components/ui/Skeleton";
import { GalleryPost, GalleryComment } from "@/lib/types";
import {
  getGalleryPosts,
  createGalleryPost,
  likeGalleryPost,
  getGalleryComments,
  createGalleryComment,
  deleteGalleryComment,
} from "@/lib/api/gallery";
import { getStoredSession } from "@/lib/api/auth";

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [sort, setSort] = useState<"top" | "latest">("top");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);

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

  // Comments state for selectedPost
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState("");
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const session = getStoredSession();
    getGalleryPosts({ sort, limit: 24, accessToken: session?.accessToken })
      .then((data) => {
        if (isMounted) {
          setPosts(data);
          const initialLikes: Record<string, boolean> = {};
          data.forEach((p) => {
            if (p.isLiked) {
              initialLikes[p.id] = true;
            }
          });
          setLikedPosts(initialLikes);
        }
      })
      .catch(() => {
        if (isMounted) setPosts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sort]);

  const handleOpenCreateModal = () => {
    const session = getStoredSession();
    setIsLoggedIn(Boolean(session?.accessToken));
    setShowCreateModal(true);
  };

  // Load comments whenever a post is selected
  useEffect(() => {
    if (!selectedPost) {
      setComments([]);
      setCommentContent("");
      setCommentError("");
      return;
    }
    let isMounted = true;
    setLoadingComments(true);
    const session = getStoredSession();
    if (session?.accessToken) {
      setIsLoggedIn(true);
      setCurrentUserIsAdmin(Boolean(session.isAdmin));
      if (session.user?.fullName) {
        setCommentAuthor(session.user.fullName);
      }
    }
    getGalleryComments(selectedPost.id, session?.accessToken)
      .then((data) => {
        if (isMounted) setComments(data);
      })
      .finally(() => {
        if (isMounted) setLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPost?.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentContent.trim() || submittingComment) return;

    setSubmittingComment(true);
    setCommentError("");
    const session = getStoredSession();

    try {
      const newComment = await createGalleryComment(
        selectedPost.id,
        {
          content: commentContent.trim(),
          authorName: commentAuthor.trim() || undefined,
        },
        session?.accessToken,
      );

      setComments((prev) => [...prev, newComment]);
      setCommentContent("");

      // Increment comments count on selected post and grid
      setSelectedPost((prev) =>
        prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null,
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
            : p,
        ),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post comment.";
      setCommentError(msg);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost || deletingCommentId) return;
    setDeletingCommentId(commentId);
    const session = getStoredSession();

    try {
      await deleteGalleryComment(commentId, session?.accessToken);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      // Decrement comments count
      setSelectedPost((prev) =>
        prev
          ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) }
          : null,
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) }
            : p,
        ),
      );
    } catch (err: unknown) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleLike = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const session = getStoredSession();
    if (!session?.accessToken) {
      setShowLoginPromptModal(true);
      return;
    }

    const isCurrentlyLiked = Boolean(likedPosts[postId]);
    const nextIsLiked = !isCurrentlyLiked;

    // Optimistically toggle
    setLikedPosts((prev) => ({ ...prev, [postId]: nextIsLiked }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likesCount: Math.max(0, nextIsLiked ? p.likesCount + 1 : p.likesCount - 1),
            isLiked: nextIsLiked,
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
              likesCount: Math.max(0, nextIsLiked ? prev.likesCount + 1 : prev.likesCount - 1),
              isLiked: nextIsLiked,
            }
          : null,
      );
    }

    try {
      const res = await likeGalleryPost(postId, session.accessToken);
      setLikedPosts((prev) => ({ ...prev, [postId]: res.isLiked }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likesCount: Math.max(0, res.likesCount), isLiked: res.isLiked }
            : p,
        ),
      );
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost((prev) =>
          prev
            ? { ...prev, likesCount: Math.max(0, res.likesCount), isLiked: res.isLiked }
            : null,
        );
      }
    } catch {
      // Revert on error
      setLikedPosts((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likesCount: Math.max(0, isCurrentlyLiked ? p.likesCount + 1 : p.likesCount - 1),
              isLiked: isCurrentlyLiked,
            };
          }
          return p;
        }),
      );
    }
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
                onClick={handleOpenCreateModal}
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
              <div className="mt-8 columns-1 gap-gutter sm:columns-2 lg:columns-3">
                {[
                  "aspect-[4/5]",
                  "aspect-square",
                  "aspect-[4/3]",
                  "aspect-square",
                  "aspect-[4/5]",
                  "aspect-[4/3]",
                ].map((aspect, i) => (
                  <div key={i} className="mb-gutter break-inside-avoid overflow-hidden rounded-xl bg-background-white p-3 shadow-soft space-y-3">
                    <Skeleton className={`w-full ${aspect} rounded-lg`} />
                    <div className="flex justify-between items-center px-1">
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-7 w-12 rounded-full" />
                    </div>
                  </div>
                ))}
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

                      {/* Top Right Badges */}
                      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                        {Boolean(item.commentsCount && item.commentsCount > 0) && (
                          <div className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                            <MessageSquare size={12} />
                            <span>{item.commentsCount}</span>
                          </div>
                        )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm">
            <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-surface-container-low shadow-2xl flex flex-col">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 max-h-[92vh] overflow-y-auto">
                {/* Left Column: Image & Equipment Specs */}
                <div className="flex flex-col bg-black/5 border-b md:border-b-0 md:border-r border-outline-variant/30">
                  <div className="relative min-h-[280px] sm:min-h-[360px] bg-black">
                    <Image
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      fill
                      sizes="(min-width: 768px) 450px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  {selectedPost.tankSpecs && (
                    <div className="p-4 sm:p-5 bg-background-white/70">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                        <span>🌿</span> Equipment &amp; Tank Specifications
                      </div>
                      <div className="mt-1.5 font-sans text-xs sm:text-sm text-on-surface font-medium leading-relaxed">
                        {selectedPost.tankSpecs}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Details & Comments Thread */}
                <div className="flex flex-col h-full justify-between p-5 sm:p-6 space-y-4">
                  <div>
                    {/* Header badges */}
                    <div className="flex items-center justify-between pr-8">
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

                    <h2 className="mt-3 font-display text-lg sm:text-headline-md font-bold text-on-surface">
                      {selectedPost.title}
                    </h2>
                    <p className="font-sans text-xs sm:text-body-md font-semibold text-tertiary">
                      Created by {selectedPost.authorName}
                    </p>

                    {selectedPost.description && (
                      <p className="mt-2.5 font-sans text-xs sm:text-body-sm text-on-surface-variant leading-relaxed">
                        {selectedPost.description}
                      </p>
                    )}

                    {/* Comments Thread Section */}
                    <div className="mt-5 border-t border-outline-variant/40 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 font-sans text-xs sm:text-sm font-bold text-on-surface">
                          <MessageSquare size={16} className="text-primary" />
                          <span>Discussion ({comments.length})</span>
                        </div>
                        {loadingComments && (
                          <Loader2 size={14} className="animate-spin text-primary" />
                        )}
                      </div>

                      {/* Comments Stream */}
                      <div className="space-y-2.5 max-h-52 sm:max-h-60 overflow-y-auto pr-1 no-scrollbar">
                        {loadingComments && comments.length === 0 ? (
                          <div className="space-y-2 py-2">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-outline-variant/50 p-4 text-center text-xs text-on-surface-variant">
                            No comments yet. Be the first to ask about plants, hardscape, or share tips!
                          </div>
                        ) : (
                          comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="group relative rounded-xl bg-surface-container/60 p-3 text-xs border border-outline-variant/20 hover:border-outline-variant/40 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                                    {comment.authorName.charAt(0) || "A"}
                                  </div>
                                  <span className="font-bold text-on-surface">
                                    {comment.authorName}
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant/70">
                                    {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>

                                {(comment.isOwner || currentUserIsAdmin) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    disabled={deletingCommentId === comment.id}
                                    className="text-on-surface-variant/50 hover:text-rose-500 transition-colors p-1"
                                    title="Delete comment"
                                  >
                                    {deletingCommentId === comment.id ? (
                                      <Loader2 size={12} className="animate-spin text-rose-500" />
                                    ) : (
                                      <Trash2 size={12} />
                                    )}
                                  </button>
                                )}
                              </div>
                              <p className="mt-1.5 text-on-surface-variant leading-relaxed pl-8">
                                {comment.content}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment submission form */}
                      <form onSubmit={handleAddComment} className="mt-3.5 space-y-2">
                        {!isLoggedIn && (
                          <input
                            type="text"
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            placeholder="Your Name (Optional)"
                            maxLength={50}
                            className="w-full rounded-lg border border-outline-variant/50 bg-background-white px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none"
                          />
                        )}
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write a comment or question..."
                            maxLength={500}
                            className="w-full rounded-xl border border-outline-variant/60 bg-background-white px-3.5 py-2.5 pr-10 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="submit"
                            disabled={!commentContent.trim() || submittingComment}
                            className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40 hover:opacity-90"
                            title="Send comment"
                          >
                            {submittingComment ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Send size={13} />
                            )}
                          </button>
                        </div>
                        {commentError && (
                          <p className="text-[11px] text-rose-500">{commentError}</p>
                        )}
                      </form>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/40 pt-3 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedPost(null)}
                      className="rounded-md bg-surface-container px-4 py-1.5 font-sans text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
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

        {/* Guest Sign-In Prompt Modal */}
        <ConfirmModal
          isOpen={showLoginPromptModal}
          onClose={() => setShowLoginPromptModal(false)}
          onConfirm={() => {
            setShowLoginPromptModal(false);
            router.push("/login?redirect=/community");
          }}
          title="Sign In Required"
          message="You need an active account to like and save community aquascapes. Sign in now to join the community!"
          confirmText="Sign In / Register"
          cancelText="Maybe Later"
          variant="primary"
        />
      </main>
      <Footer />
    </>
  );
}
