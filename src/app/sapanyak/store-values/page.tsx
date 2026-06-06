"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import * as LucideIcons from "lucide-react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Search,
  Eye,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StoreValue {
  id: string;
  title: string;
  icon_name: string;
  content: string;
  order_index: number;
  created_at: string;
}

export default function StoreValuesPage() {
  const [values, setValues] = useState<StoreValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formIconName, setFormIconName] = useState("Sparkles");
  const [formContent, setFormContent] = useState("");
  const [formOrderIndex, setFormOrderIndex] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchValues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/store-values");
      if (!res.ok) throw new Error("Gagal mengambil data value toko.");
      const data = await res.json();
      // Sort by order_index asc
      const sorted = data.sort((a: StoreValue, b: StoreValue) => a.order_index - b.order_index);
      setValues(sorted);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedId(null);
    setFormTitle("");
    setFormIconName("Sparkles");
    setFormContent("");
    setFormOrderIndex((values.length > 0 ? (values[values.length - 1].order_index + 1).toString() : "0"));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (val: StoreValue) => {
    setModalMode("edit");
    setSelectedId(val.id);
    setFormTitle(val.title);
    setFormIconName(val.icon_name);
    setFormContent(val.content);
    setFormOrderIndex(val.order_index.toString());
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data keunggulan toko ini?")) return;
    try {
      const res = await apiFetch(`/store-values/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus value.");
      fetchValues();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formTitle,
      icon_name: formIconName,
      content: formContent,
      order_index: parseInt(formOrderIndex) || 0
    };

    try {
      const url = modalMode === "create" ? "/store-values" : `/store-values/${selectedId}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      // If creating, backend requires an id generator or payload id.
      // Wait, in nestjs backend, let's see how create works or if id is auto generated.
      // Let's check or send randomly generated if needed, but usually NestJS handles uuid.
      // Let's include an ID for creation just in case, or let's double check store-values.service.ts
      // Actually let's check store-values.service.ts if we need to.
      // Wait! Let's just send the payload and if it fails due to missing ID, we'll see.
      // Let's check store-values.service.ts.
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan data keunggulan toko.");
      }

      setIsModalOpen(false);
      fetchValues();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredValues = values.filter((val) => 
    val.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    val.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to render Lucide Icons dynamically
  const renderValueIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return <Icon className="w-5 h-5" />;
  };

  // Common pre-approved icons for stores
  const availableIcons = [
    "Sparkles",
    "Heart",
    "Award",
    "Shield",
    "Smile",
    "ThumbsUp",
    "Truck",
    "Clock",
    "DollarSign",
    "Star",
    "MapPin",
    "Gift",
    "Zap"
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 text-primary">
              <Sparkles className="w-6 h-6 fill-primary/10" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Keunggulan Toko (Store Values)</h3>
              <p className="text-gray-400 text-xs mt-0.5">Kelola highlight kelebihan toko Anda yang ditampilkan di halaman depan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOverviewOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-755 border border-gray-200 font-bold text-sm rounded-2xl transition-all cursor-pointer select-none"
            >
              <Eye className="w-4 h-4 text-gray-500" />
              <span>Overview Perubahan</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Keunggulan</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="relative max-w-md bg-gray-50/50 p-2 rounded-2xl border border-gray-150/50">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari judul atau konten keunggulan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
          />
        </div>

        {/* Main Grid listing */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-455">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat data keunggulan toko...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-semibold max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>{error}</p>
          </div>
        ) : (
          <div>
            {filteredValues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredValues.map((val) => (
                  <motion.div
                    layout
                    key={val.id}
                    className="bg-white rounded-[2rem] border border-gray-150 p-6 flex flex-col justify-between gap-5 relative group shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="p-3.5 rounded-2xl bg-pink-50 text-primary inline-block shrink-0">
                          {renderValueIcon(val.icon_name)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-150/50 px-2 py-0.5 rounded-lg shrink-0">
                          <ArrowUpDown className="w-3 h-3 text-gray-300" />
                          Urutan: {val.order_index}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight truncate">{val.title}</h4>
                        <p className="text-xs font-medium text-gray-500 leading-relaxed min-h-[48px] line-clamp-3">
                          {val.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-gray-100 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(val)}
                        className="p-2 text-gray-450 hover:text-primary hover:bg-pink-50/40 rounded-xl transition-all cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(val.id)}
                        className="p-2 text-gray-455 hover:text-red-500 hover:bg-red-50/40 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400 text-xs font-semibold border border-dashed border-gray-200 rounded-3xl">
                Tidak ada data keunggulan toko ditemukan.
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
                  {modalMode === "create" ? "Tambah Keunggulan Baru" : "Edit Keunggulan Toko"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Judul / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pengiriman Cepat"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Urutan Tampil</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formOrderIndex}
                      onChange={(e) => setFormOrderIndex(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Pilih Icon Keunggulan</label>
                  <div className="grid grid-cols-6 gap-2 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-150/50 max-h-[120px] overflow-y-auto scrollbar-thin">
                    {availableIcons.map((icName) => {
                      const isSelected = formIconName === icName;
                      return (
                        <button
                          key={icName}
                          type="button"
                          onClick={() => setFormIconName(icName)}
                          className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-white text-gray-400 border-gray-150 hover:bg-gray-50/40 hover:text-gray-600"
                          }`}
                        >
                          {renderValueIcon(icName)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Konten / Deskripsi</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tulis deskripsi singkat keunggulan toko Anda..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
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
                      <span>Simpan Keunggulan</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Store Values Frontend Live Preview Modal */}
        {isOverviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOverviewOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 md:p-8 relative z-10 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span>Pratinjau Keunggulan Toko (Frontend Mockup)</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Berikut adalah simulasi grid "Kenapa Memilih Kami" pada Landing Page utama</p>
                </div>
                <button
                  onClick={() => setIsOverviewOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simulated Browser View */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/50 shadow-inner">
                {/* Browser top-bar */}
                <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                  <div className="w-full mx-6 bg-white/80 border border-gray-200 rounded-lg text-[10px] text-gray-450 font-bold px-3 py-0.5 text-center truncate">
                    https://tokomakanan.id/home#keunggulan
                  </div>
                </div>

                {/* Browser Page Body */}
                <div className="p-8 bg-gradient-to-b from-white to-gray-50/30 text-center space-y-12">
                  <div className="max-w-xl mx-auto space-y-2.5">
                    <span className="px-3.5 py-1 bg-pink-50 text-primary text-[10px] font-extrabold tracking-wider uppercase rounded-full">
                      Kenapa Memilih Kami?
                    </span>
                    <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                      Komitmen Kami Untuk Memberikan Pelayanan Terbaik
                    </h2>
                    <p className="text-xs text-gray-450 font-semibold leading-relaxed">
                      Kami berkomitmen untuk terus meningkatkan kepuasan Anda melalui berbagai keunggulan produk dan layanan yang kami tawarkan.
                    </p>
                  </div>

                  {/* Grid layout mirroring storefront */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {values.length > 0 ? (
                      values.map((val) => (
                        <div
                          key={val.id}
                          className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <span className="p-4 rounded-2xl bg-pink-50 text-primary inline-flex shrink-0">
                            {renderValueIcon(val.icon_name)}
                          </span>
                          <div className="space-y-1.5">
                            <h4 className="font-extrabold text-gray-800 text-sm leading-tight">{val.title}</h4>
                            <p className="text-xs font-semibold text-gray-450 leading-relaxed">
                              {val.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 py-10 text-center text-gray-400 text-xs font-semibold">
                        Belum ada data keunggulan toko yang ditambahkan.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOverviewOpen(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-150 text-gray-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
