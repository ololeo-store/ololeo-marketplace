"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  Star,
  Search,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  product_id: string | null;
  user_id: string | null;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [revRes, prodRes] = await Promise.all([
        apiFetch("/reviews"),
        apiFetch("/products")
      ]);

      if (!revRes.ok || !prodRes.ok) throw new Error("Gagal mengambil data review.");

      const revData = await revRes.json();
      const prodData = await prodRes.json();

      setReviews(revData);
      setProducts(prodData);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleApproval = async (review: Review) => {
    setIsTogglingId(review.id);
    try {
      const res = await apiFetch(`/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_approved: !review.is_approved
        })
      });

      if (!res.ok) throw new Error("Gagal mengubah status persetujuan.");

      // Local state update for smooth animation/instant feedback
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, is_approved: !r.is_approved } : r))
      );
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status.");
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;
    try {
      const res = await apiFetch(`/reviews/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus review.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  // Filter logic
  const filteredReviews = reviews.filter((r) => {
    const productName = products.find((p) => p.id === r.product_id)?.name || "Produk Terhapus";
    const matchSearch = r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = filterStatus === "all" ||
      (filterStatus === "approved" && r.is_approved) ||
      (filterStatus === "pending" && !r.is_approved);

    return matchSearch && matchStatus;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-100"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/60 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-pink-50 text-primary">
            <Star className="w-6 h-6 fill-primary" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Ulasan & Review Pelanggan</h3>
            <p className="text-gray-400 text-xs mt-0.5">Moderasi rating dan komentar pelanggan sebelum ditampilkan ke publik</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-150/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari customer, komentar, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs font-bold text-gray-700 cursor-pointer shadow-sm custom-select transition-all"
            >
              <option value="all">Semua Status Moderasi</option>
              <option value="approved">Disetujui (Approved)</option>
              <option value="pending">Menunggu Moderasi (Pending)</option>
            </select>
          </div>
        </div>

        {/* Reviews Listing Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat ulasan pelanggan...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-semibold max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>{error}</p>
          </div>
        ) : (
          <div>
            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReviews.map((rev) => {
                  const reviewedProduct = products.find((p) => p.id === rev.product_id);
                  return (
                    <motion.div
                      layout
                      key={rev.id}
                      className="bg-white rounded-[2rem] border border-gray-150 p-6 flex flex-col justify-between gap-5 relative group shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{rev.customer_name}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              Produk:{" "}
                              <span className="text-primary font-bold">
                                {reviewedProduct?.name || "Produk Terhapus"}
                              </span>
                            </p>
                          </div>
                          {renderStars(rev.rating)}
                        </div>

                        <p className="text-xs font-medium text-gray-600 leading-relaxed italic bg-gray-50/50 p-4 rounded-2xl border border-gray-150/40">
                          &ldquo;{rev.comment || "Tidak ada ulasan tertulis."}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 shrink-0">
                        {/* Quick Moderation Toggle Button */}
                        <button
                          disabled={isTogglingId === rev.id}
                          onClick={() => handleToggleApproval(rev)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer select-none ${
                            rev.is_approved
                              ? "bg-green-50 text-green-600 border-green-150 hover:bg-green-100/30"
                              : "bg-amber-50 text-amber-600 border-amber-150 hover:bg-amber-100/30"
                          }`}
                        >
                          {isTogglingId === rev.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : rev.is_approved ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                          <span>{rev.is_approved ? "Disetujui" : "Sembunyi"}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/40 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400 text-xs font-semibold border border-dashed border-gray-200 rounded-3xl">
                Tidak ada ulasan pelanggan ditemukan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
