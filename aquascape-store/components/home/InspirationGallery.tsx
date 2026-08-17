"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageSquare, ArrowRight, X, Sparkles } from "lucide-react";
import { GalleryPost } from "@/lib/types";
import { getGalleryPosts, likeGalleryPost } from "@/lib/api/gallery";
import { getStoredSession } from "@/lib/api/auth";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

const aspectClasses: Record<string, string> = {
  tall: "aspect-[4/5]",
  wide: "aspect-[4/3]",
  square: "aspect-square",
};

export default function InspirationGallery() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getGalleryPosts({ sort: "top", limit: 6 }).then((data) => setPosts(data));
  }, []);

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

  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <SectionHeading
        align="center"
        title="Community Aquascape Showcase"
        subtitle="Top-voted masterpieces created by our Indonesian aquascaping community."
        action={{ label: "Visit Community Hub", href: "/community" }}
      />

      {/* Masonry Grid */}
      <div className="columns-1 gap-gutter sm:columns-2 lg:columns-3">
        {posts.map((item) => {
          const sizeKey = item.size ?? "wide";
          const isLiked = likedPosts[item.id];

          return (
            <div
              key={item.id}
              onClick={() => setSelectedPost(item)}
              className={`group relative mb-gutter break-inside-avoid overflow-hidden rounded-xl shadow-soft transition-all duration-300 hover:shadow-lg cursor-pointer ${
                aspectClasses[sizeKey] || "aspect-[4/3]"
              }`}
            >
              <Image
                src={item.image}
                alt={item.title || "Aquascape photography"}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Heart Badge Top Right */}
              <div className="absolute right-3 top-3 z-10">
                <button
                  type="button"
                  onClick={(e) => handleLike(item.id, e)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all ${
                    isLiked
                      ? "bg-rose-500 text-white shadow-md"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                >
                  <Heart size={14} className={isLiked ? "fill-white" : ""} />
                  <span>{item.likesCount}</span>
                </button>
              </div>

              {/* Bottom Info Gradient Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white transition-all">
                <h3 className="font-sans font-bold text-body-lg text-white">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-white/80">
                  by {item.authorName}
                </p>
              </div>

              {/* Overlay hover CTA */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-white/90 px-5 py-2 font-sans text-label-md font-semibold text-primary shadow-lg backdrop-blur-md">
                  View Tank Specs
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-6 py-3 font-sans font-medium text-primary shadow-sm transition-all hover:bg-primary hover:text-on-primary"
        >
          <Sparkles size={18} />
          <span>Explore All Community Creations &amp; Post Yours</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Post Detail View Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-surface-container-low shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
              <div className="relative min-h-[300px] bg-black md:min-h-[450px]">
                <Image
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-between p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Community Aquascape
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLike(selectedPost.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        likedPosts[selectedPost.id]
                          ? "bg-rose-500 text-white"
                          : "bg-surface-container-high text-on-surface hover:bg-rose-100"
                      }`}
                    >
                      <Heart
                        size={14}
                        className={likedPosts[selectedPost.id] ? "fill-white" : ""}
                      />
                      <span>{selectedPost.likesCount} Hearts</span>
                    </button>
                  </div>

                  <h2 className="mt-3 font-display text-headline-md font-bold text-on-surface">
                    {selectedPost.title}
                  </h2>
                  <p className="font-sans text-body-md font-semibold text-tertiary">
                    Created by {selectedPost.authorName}
                  </p>

                  {selectedPost.description && (
                    <p className="mt-4 font-sans text-body-md text-on-surface-variant">
                      {selectedPost.description}
                    </p>
                  )}

                  {selectedPost.tankSpecs && (
                    <div className="mt-4 rounded-lg bg-background-white p-3 border border-outline-variant">
                      <div className="text-xs font-bold uppercase tracking-wider text-tertiary">
                        Tank Setup &amp; Specs
                      </div>
                      <div className="mt-1 font-sans text-body-md text-on-surface font-medium">
                        {selectedPost.tankSpecs}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-outline-variant pt-4 flex items-center justify-between">
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    <span>View More in Community Hub</span>
                    <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    className="rounded-md bg-surface-container px-4 py-2 text-xs font-semibold text-on-surface"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionReveal>
  );
}

