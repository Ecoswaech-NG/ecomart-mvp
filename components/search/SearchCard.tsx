"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";

const FALLBACK = "https://cloudfront-eu-central-1.images.arcpublishing.com/thenational/C7BBKEO5NNNFT6CUY7TGRDHX44.jpg";

const GRADE_COLOR: Record<string, string> = {
  A: "#3fb950", B: "#58a6ff", C: "#d29922", D: "#f85149",
};

export interface SearchListing {
  id:           number;
  listingTitle: string | null;
  make:         string;
  model:        string;
  year:         number;
  mileage:      number;
  location:     string;
  sellingPrice: number;
  condition:    string;
  offerType:    string | null;
  images:       { imageUrl: string }[];
  batteryReport: { id: string; grade: string; sohScore: number } | null;
}

interface Props {
  listing:      SearchListing;
  isFavourite:  boolean;
  onToggleFav:  (id: number) => void;
}

export default function SearchCard({ listing, isFavourite, onToggleFav }: Props) {
  const img   = listing.images[0]?.imageUrl || FALLBACK;
  const grade = listing.batteryReport?.grade;

  return (
    <div className="card-interactive overflow-hidden flex flex-col h-full">

      {/* Image */}
      <div className="relative h-44 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
        <img
          src={img}
          alt={listing.listingTitle ?? `${listing.make} ${listing.model}`}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />

        {/* Offer badge */}
        {listing.offerType && (
          <span className="absolute top-2 right-2 badge-error">
            {listing.offerType}
          </span>
        )}

        {/* Battery grade badge */}
        {grade && (
          <span
            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${GRADE_COLOR[grade]}20`,
              color:       GRADE_COLOR[grade],
              border:      `1.5px solid ${GRADE_COLOR[grade]}`,
            }}
          >
            {grade} · {listing.batteryReport?.sohScore}%
          </span>
        )}

        {/* Bookmark */}
        <button
          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 hover:scale-110 transition-transform shadow"
          onClick={(e) => { e.preventDefault(); onToggleFav(listing.id); }}
          aria-label={isFavourite ? "Remove bookmark" : "Bookmark"}
        >
          {isFavourite
            ? <BookmarkCheck className="h-4 w-4 text-primary" />
            : <Bookmark className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          }
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-1 mb-1">
          {listing.listingTitle || `${listing.year} ${listing.make} ${listing.model}`}
        </h3>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 text-xs text-muted mb-2">
          <span>{listing.year}</span>
          <span>·</span>
          <span>{listing.mileage.toLocaleString()} km</span>
          <span>·</span>
          <span>{listing.location}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-current opacity-10">
          <span className="font-bold text-primary text-sm">
            ₦{Number(listing.sellingPrice).toLocaleString()}
          </span>
          <Link
            href={`/listing-details/${listing.id}`}
            className="btn-primary text-xs"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}