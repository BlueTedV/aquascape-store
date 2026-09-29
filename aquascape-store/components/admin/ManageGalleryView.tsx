"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Heart,
  MessageSquare,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
} from "lucide-react";
import { GalleryPost, GalleryComment } from "@/lib/types";
import {
  getAdminGalleryPosts,
  deleteAdminGalleryPost,
  deleteAdminGalleryComment,
} from "@/lib/api/admin";
import { getGalleryComments } from "@/lib/api/gallery";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Skeleton from "@/components/ui/Skeleton";

export default function ManageGalleryView() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Post deletion state
  const [postToDelete, setPostToDelete] = useState<GalleryPost | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Comment moderation modal state
  const [moderatingPost, setModeratingPost] = useState<GalleryPost | null>(null);
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getAdminGalleryPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load showcase posts.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filtered posts based on search query
  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      (p.tankSpecs && p.tankSpecs.toLowerCase().includes(q))
    );
  });

  // Aggregated showcase statistics
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);

  // Handle post deletion confirmation
  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    const id = postToDelete.id;
    setDeletingPostId(id);

    try {
      await deleteAdminGalleryPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg(`Showcase '${postToDelete.title}' deleted successfully.`);
      setPostToDelete(null);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete showcase post.";
      setErrorMsg(msg);
    } finally {
      setDeletingPostId(null);
    }
  };

  // Open comment moderation modal
  const handleOpenModeration = async (post: GalleryPost) => {
    setModeratingPost(post);
    setComments([]);
    setLoadingComments(true);

    try {
      const commentData = await getGalleryComments(post.id);
      setComments(commentData);
    } catch (err: unknown) {
      console.error("Failed to load comments for moderation:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Delete a specific comment during moderation
  const handleDeleteComment = async (commentId: string) => {
    if (!moderatingPost || deletingCommentId) return;
    setDeletingCommentId(commentId);

    try {
      await deleteAdminGalleryComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      // Decrement comment count in local posts state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === moderatingPost.id
            ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) }
            : p,
        ),
      );

      setModeratingPost((prev) =>
        prev
          ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) }
          : null,
      );

      setSuccessMsg("Comment deleted.");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete comment.";
      setErrorMsg(msg);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-700 animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs sm:text-sm font-semibold text-rose-700 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Total Showcases
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-on-surface">
            {posts.length}
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            User-submitted aquascapes
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Community Hearts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Heart size={16} className="fill-rose-500" />
            </div>
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-on-surface">
            {totalLikes}
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            Total likes given by visitors
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Comments &amp; Inquiries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-on-surface">
            {totalComments}
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            Discussion interactions
          </p>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-surface-container p-3 sm:p-4 border border-outline-variant/30">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search showcases by title, author name, or specs..."
            className="w-full rounded-xl border border-outline-variant/60 bg-background-white py-2 pl-9 pr-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="button"
          onClick={fetchPosts}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-high px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Gallery Posts List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container p-4 space-y-3"
            >
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container p-12 text-center">
          <Sparkles size={32} className="mx-auto text-on-surface-variant/40" />
          <h3 className="mt-3 font-display text-base font-bold text-on-surface">
            No Showcase Posts Found
          </h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            {searchQuery
              ? "No community creations match your search keywords."
              : "No community showcases have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container shadow-xs hover:border-outline-variant/60 hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Photo Preview & Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/10">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-wider">
                      {post.size ?? "wide"}
                    </span>
                  </div>
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md">
                      <Heart size={10} className="fill-white" />
                      {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-blue-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md">
                      <MessageSquare size={10} />
                      {post.commentsCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2">
                  <h4 className="font-display text-sm font-bold text-on-surface line-clamp-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span>By {post.authorName}</span>
                    <span>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                    </span>
                  </div>

                  {post.tankSpecs && (
                    <div className="rounded-lg bg-background-white/70 p-2 text-[11px] text-on-surface font-medium line-clamp-2 border border-outline-variant/30">
                      🌿 {post.tankSpecs}
                    </div>
                  )}

                  {post.description && (
                    <p className="text-[11px] text-on-surface-variant/80 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-outline-variant/30 bg-surface-container-high/40 p-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenModeration(post)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <MessageSquare size={13} />
                  <span>Comments ({post.commentsCount ?? 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostToDelete(post)}
                  className="flex items-center justify-center rounded-xl bg-rose-500/10 p-2 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                  title="Delete showcase post"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        title="Delete Showcase Post"
        message={`Are you sure you want to permanently delete '${postToDelete?.title}'? All likes and comments associated with this layout will also be removed.`}
        confirmText="Delete Showcase"
        variant="danger"
        isLoading={Boolean(deletingPostId)}
        onConfirm={handleConfirmDeletePost}
        onClose={() => setPostToDelete(null)}
      />

      {/* Comment Moderation Modal */}
      {moderatingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
              <div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                  Comment Moderation
                </span>
                <h3 className="mt-1 font-display text-base sm:text-lg font-bold text-on-surface line-clamp-1">
                  {moderatingPost.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModeratingPost(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface"
              >
                <X size={16} />
              </button>
            </div>

            {/* Comment Stream */}
            <div className="my-4 flex-1 space-y-3 overflow-y-auto pr-1 max-h-[50vh] no-scrollbar">
              {loadingComments ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline-variant/60 p-8 text-center text-xs text-on-surface-variant">
                  No comments have been posted on this showcase yet.
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-outline-variant/30 bg-surface-container p-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                          {comment.authorName.charAt(0) || "A"}
                        </div>
                        <span className="font-bold text-on-surface">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-on-surface-variant pl-8 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                      className="shrink-0 rounded-lg p-1.5 text-on-surface-variant/50 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                      title="Delete offensive comment"
                    >
                      {deletingCommentId === comment.id ? (
                        <Loader2 size={13} className="animate-spin text-rose-600" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-outline-variant/40 pt-3 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                Total comments: <strong className="text-on-surface">{comments.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setModeratingPost(null)}
                className="rounded-xl bg-surface-container-high px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                Close Moderation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
