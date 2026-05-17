"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Bookmark } from "lucide-react";

const FALLBACK = "https://cloudfront-eu-central-1.images.arcpublishing.com/thenational/C7BBKEO5NNNFT6CUY7TGRDHX44.jpg";

interface Listing {
  id: number; listingTitle: string | null;
  make: string; model: string; year: number;
  sellingPrice: number; mileage: number; condition: string;
  images: { imageUrl: string }[];
}

export default function Favourites() {
  const { user } = useAuth();
  const storageKey = `favs_${user?.email ?? "guest"}`;

  const [ids, setIds]           = useState<number[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(storageKey) ?? "[]")); }
    catch { setIds([]); }
  }, [storageKey]);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    // Fetch each bookmarked listing
    Promise.all(
      ids.map((id) =>
        fetch(`/api/listings/cars?id=${id}`)
          .then((r) => r.json())
          .then((d) => d.listings?.[0] ?? null)
          .catch(() => null)
      )
    )
      .then((results) => setListings(results.filter(Boolean) as Listing[]))
      .finally(() => setLoading(false));
  }, [ids]);

  const removeFav = (id: number) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    setListings((prev) => prev.filter((l) => l.id !== id));
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <div className="mt-4">
      <h2 className="font-bold text-2xl text-foreground mb-6">My Favourites</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl card-base animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="font-semibold text-foreground">No saved listings</p>
          <p className="text-sm text-muted mt-1">
            Bookmark vehicles while browsing to save them here
          </p>
          <Link href="/search" className="inline-block mt-4 text-sm text-primary hover:underline font-medium">
            Browse vehicles →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className="card-interactive overflow-hidden flex flex-col rounded-2xl">
              <div className="relative h-44">
                <img
                  src={listing.images[0]?.imageUrl || FALLBACK}
                  alt={listing.listingTitle ?? `${listing.make} ${listing.model}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFav(listing.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow"
                  title="Remove bookmark"
                >
                  <Bookmark className="w-4 h-4 text-primary fill-primary" />
                </button>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="font-semibold text-sm text-foreground line-clamp-1">
                  {listing.listingTitle || `${listing.year} ${listing.make} ${listing.model}`}
                </p>
                <div className="flex gap-2 text-xs text-muted mt-1">
                  <span>{listing.year}</span><span>·</span>
                  <span>{listing.mileage.toLocaleString()} km</span><span>·</span>
                  <span>{listing.condition}</span>
                </div>
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-current border-opacity-10">
                  <span className="font-bold text-[#7b2ff2] text-sm">
                    ₦{Number(listing.sellingPrice).toLocaleString()}
                  </span>
                  <Link
                    href={`/listing-details/${listing.id}`}
                    className="text-xs bg-[#220a77] text-white px-3 py-1.5 rounded-lg hover:bg-[#7b2ff2] transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}