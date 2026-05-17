"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

interface Accessory {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: string;
  price: number;
  location: string;
  description: string;
  images: Array<{ imageUrl: string }>;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  partNumber?: string;
  voltageRating?: string;
  connectorType?: string;
  chargingKw?: string;
  warranty?: string;
  certifications?: string[];
  userName: string;
  createdAt: string;
}

export default function AccessoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAccessory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/accessories/${id}`);
        if (!res.ok) throw new Error("Failed to fetch accessory");
        const data = await res.json();
        setAccessory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading accessory");
      } finally {
        setLoading(false);
      }
    };

    fetchAccessory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b2ff2] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading accessory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !accessory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0822]">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error || "Accessory not found"}</p>
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
            {accessory.images.length > 0 && (
              <div className="mb-8">
                <img
                  src={accessory.images[0].imageUrl}
                  alt={accessory.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="card-base rounded-lg p-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {accessory.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">By {accessory.brand}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{accessory.description}</p>
              </div>

              {/* Technical Specs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {accessory.category && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                      <p className="font-medium text-gray-900 dark:text-white">{accessory.category}</p>
                    </div>
                  )}
                  {accessory.condition && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Condition</p>
                      <p className="font-medium text-gray-900 dark:text-white">{accessory.condition}</p>
                    </div>
                  )}
                  {accessory.vehicleMake && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Compatible Make</p>
                      <p className="font-medium text-gray-900 dark:text-white">{accessory.vehicleMake}</p>
                    </div>
                  )}
                  {accessory.partNumber && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Part Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{accessory.partNumber}</p>
                    </div>
                  )}
                  {accessory.warranty && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Warranty</p>
                      <p className="font-medium text-gray-900 dark:text-white">{accessory.warranty}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card-base rounded-lg p-6 sticky top-20">
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Price</p>
                <p className="text-4xl font-bold bg-linear-to-r from-[#00d9d9] to-[#c946ef] bg-clip-text text-transparent">₦{accessory.price.toLocaleString()}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{accessory.location}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Seller</p>
                <p className="font-medium text-gray-900 dark:text-white">{accessory.userName}</p>
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
