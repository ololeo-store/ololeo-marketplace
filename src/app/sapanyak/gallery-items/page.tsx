"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryItem {
  id: string;
  product_id: string | null;
  image_url: string;
  caption: string | null;
}

interface Product {
  id: string;
  name: string;
}

export default function GalleryItemsPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [galleryRes, prodRes] = await Promise.all([
        apiFetch("/gallery-items"),
        apiFetch("/products")
      ]);

      if (!galleryRes.ok || !prodRes.ok) throw new Error("Gagal mengambil data galeri.");

      const galleryData = await galleryRes.json();
      const prodData = await prodRes.json();

      setItems(galleryData);
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

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedId(null);
    setFormImageUrl("");
    setFormCaption("");
    setFormProductId("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setModalMode("edit");
    setSelectedId(item.id);
    setFormImageUrl(item.image_url);
    setFormCaption(item.caption || "");
    setFormProductId(item.product_id || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto galeri ini?")) return;
    try {
      const res = await apiFetch(`/gallery-items/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus item galeri.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      image_url: formImageUrl,
      caption: formCaption || null,
      product_id: formProductId || null
    };

    try {
      const url = modalMode === "create" ? "/gallery-items" : `/gallery-items/${selectedId}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan data galeri.");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const productName = products.find((p) => p.id === item.product_id)?.name || "";
    const term = searchQuery.toLowerCase();
    return (
      (item.caption && item.caption.toLowerCase().includes(term)) ||
      productName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/60 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 text-primary">
              <ImageIcon className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Foto Galeri Buket</h3>
              <p className="text-gray-400 text-xs mt-0.5">Kelola foto-foto buket cantik untuk dipasang pada halaman portofolio toko</p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Foto</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari berdasarkan caption atau nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
          />
        </div>

        {/* Grid and layout */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat foto galeri...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-semibold max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>{error}</p>
          </div>
        ) : (
          <div>
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => {
                  const linkedProduct = products.find((p) => p.id === item.product_id);
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      className="bg-white rounded-[2rem] border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-square overflow-hidden bg-gray-50 shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.caption || "Foto galeri"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2.5 bg-white/90 backdrop-blur-md text-gray-600 hover:text-primary hover:bg-white rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 bg-white/90 backdrop-blur-md text-gray-600 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Description */}
                      <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                        <p className="text-xs font-semibold text-gray-600 line-clamp-3 leading-relaxed">
                          {item.caption || <span className="text-gray-400 font-normal italic">Tidak ada keterangan</span>}
                        </p>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tautan Produk</span>
                          {linkedProduct ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary max-w-[120px] truncate">
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate">{linkedProduct.name}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-gray-450 italic">Tidak Terhubung</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400 text-xs font-semibold border border-dashed border-gray-200 rounded-3xl">
                Tidak ada foto galeri ditemukan.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Creation/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {modalMode === "create" ? "Tambah Foto Galeri Baru" : "Edit Foto Galeri"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">URL Link Gambar</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/foto-buket.jpg"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Hubungkan ke Produk (Optional)</label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-bold text-gray-700 cursor-pointer shadow-sm custom-select"
                  >
                    <option value="">-- Jangan hubungkan ke produk manapun --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Caption / Keterangan (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Tulis detail singkat buket ini, misalnya: Flower bucket pastel wrap pink dominan mawar putih."
                    value={formCaption}
                    onChange={(e) => setFormCaption(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3.5 bg-gray-100 text-gray-600 hover:bg-gray-150 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-2xl shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Foto</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
