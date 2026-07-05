"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  FolderTree,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/categories");
      if (!res.ok) throw new Error("Gagal mengambil data kategori.");
      const data = await res.json();
      setCategories(data);
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
    setFormName("");
    setFormDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setModalMode("edit");
    setSelectedId(category.id);
    setFormName(category.name);
    setFormDescription(category.description || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini? Semua produk di dalamnya mungkin akan terpengaruh.")) return;
    try {
      const res = await apiFetch(`/categories/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus kategori.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formName,
      description: formDescription || null
    };

    try {
      const url = modalMode === "create" ? "/categories" : `/categories/${selectedId}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan data kategori.");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-200/60 dark:border-border shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 dark:bg-primary/10 text-secondary">
              <FolderTree className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Kategori Produk</h3>
              <p className="text-gray-400 dark:text-muted-foreground text-xs mt-0.5">Kelola kategori pengelompokkan jenis bunga dan buket</p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
          />
        </div>

        {/* Table representation */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450 dark:text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat kategori...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 dark:text-red-400 font-semibold max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 dark:bg-muted text-gray-400 dark:text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-border">
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 dark:text-muted-foreground divide-y divide-gray-100 dark:divide-border">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/20 dark:hover:bg-muted transition-colors">
                      <td className="px-6 py-4.5 font-bold text-gray-800 dark:text-foreground">{c.name}</td>
                      <td className="px-6 py-4.5 text-xs font-mono text-gray-500 dark:text-muted-foreground">{c.slug}</td>
                      <td className="px-6 py-4.5 text-xs text-gray-550 max-w-sm truncate">{c.description || "-"}</td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-2 text-gray-500 dark:text-muted-foreground hover:text-primary hover:bg-pink-50/40 dark:hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 text-gray-500 dark:text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/40 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-muted-foreground text-xs font-semibold">
                      Tidak ada kategori ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              className="bg-white dark:bg-card w-full max-w-md rounded-3xl border border-gray-100 dark:border-border shadow-2xl p-6 md:p-8 relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">
                  {modalMode === "create" ? "Tambah Kategori Baru" : "Edit Kategori"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-muted-foreground rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Buket Mawar, Bunga Papan"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Deskripsi Kategori</label>
                  <textarea
                    rows={4}
                    placeholder="Masukkan deskripsi singkat kategori ini..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3.5 bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-150 font-bold text-xs rounded-2xl transition-all cursor-pointer"
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
                      <span>Simpan Kategori</span>
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
