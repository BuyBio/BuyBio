"use client";

import { cn } from "@/lib/utils";

import { IoClose } from "react-icons/io5";

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
  title?: string;
}

export function VideoModal({
  isOpen,
  onClose,
  videoId,
  title,
}: VideoModalProps) {
  if (!isOpen || !videoId) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/70 backdrop-blur-sm",
        "transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      tabIndex={-1}
    >
      <div
        className={cn(
          "relative w-full max-w-4xl mx-4",
          "bg-black rounded-2xl overflow-hidden",
          "transform transition-all duration-300",
          isOpen ? "scale-100" : "scale-95",
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
          aria-label="Close video"
        >
          <IoClose className="w-5 h-5" />
        </button>

        {/* Video Container */}
        <div className="relative w-full aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Title (optional) */}
        {title && (
          <div className="px-4 py-3 bg-black/90">
            <p className="text-sm font-semibold text-white line-clamp-2">
              {title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
