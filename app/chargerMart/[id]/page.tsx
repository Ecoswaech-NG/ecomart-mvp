"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

interface Charger {
  id: string;
  listingTitle: string;
  brand: string;
  model: string;
  type: string;
  specification: string;
  power: string;
  chargingKw?: string;
  voltage?: string;
  phases?: string;
  ipRating?: string;
  cableLength?: string;
  warranty?: string;
  price: number;
  location: string;
  description: string;
  images: Array<{ imageUrl: string }>;
  smartCharging: boolean;
  tethered: boolean;
  installationRequired: boolean;
  certifications?: string[];
  userName: string;
  createdAt: string;
}

export default function ChargerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [charger, setCharger] = useState<Charger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCharger = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listings/chargers/${id}`);
        if (!res.ok) throw new Error("Failed to fetch charger");
        const data = await res.json();
        setCharger(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading charger");
      } finally {
        setLoading(false);
      }
    };

    fetchCharger();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b2ff2] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading charger...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !charger) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error || "Charger not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            {charger.images.length > 0 && (
              <div className="mb-8">
                <img
                  src={charger.images[0].imageUrl}
                  alt={charger.listingTitle}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="card-base rounded-lg p-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {charger.listingTitle}
                </h1>
                <p className="text-muted">{charger.brand} {charger.model}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{charger.description}</p>
              </div>

              {/* Technical Specs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {charger.type && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Charger Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{charger.type}</p>
                    </div>
                  )}
                  {charger.specification && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Connector</p>
                      <p className="font-medium text-gray-900 dark:text-white">{charger.specification}</p>
                    </div>
                  )}
                  {charger.power && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Power Output</p>
                      <p className="font-medium text-gray-900 dark:text-white">{charger.power}</p>
                    </div>
                  )}
                  {charger.voltage && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Voltage</p>
                      <p className="font-medium text-gray-900 dark:text-white">{charger.voltage}</p>
                    </div>
                  )}
                  {charger.ipRating && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">IP Rating</p>
                      <p className="font-medium text-gray-900 dark:text-white">{charger.ipRating}</p>
                    </div>
                  )}
                  {charger.warranty && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Warranty</p>
                      <p className="font-medium text-gray-900 dark:text-white">{charger.warranty}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {charger.smartCharging && (
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                    Smart Charging
                  </span>
                )}
                {charger.tethered && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                    Tethered Cable
                  </span>
                )}
                {charger.installationRequired && (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-sm">
                    Installation Required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#18122b] rounded-lg p-6 sticky top-20">
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Price</p>
                <p className="text-4xl font-bold bg-linear-to-r from-[#00d9d9] to-[#c946ef] bg-clip-text text-transparent">₦{charger.price.toLocaleString()}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{charger.location}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Seller</p>
                <p className="font-medium text-gray-900 dark:text-white">{charger.userName}</p>
              </div>

              <Button className="w-full bg-linear-to-r from-[#00d9d9] to-[#c946ef] hover:from-[#00c5c5] hover:to-[#b033dd] text-white py-6 rounded-lg font-semibold">
                Contact Seller
              </Button>

              <Button variant="outline" className="w-full mt-3 border-[#00d9d9] text-[#00d9d9] hover:bg-[#00d9d9]/10 dark:hover:bg-[#00d9d9]/5">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
