"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  Award,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  description: string | null;
  stock: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscountPrice, setFormDiscountPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        apiFetch("/products"),
        apiFetch("/categories")
      ]);

      if (!prodRes.ok || !catRes.ok) throw new Error("Gagal mengambil data katalog.");

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData);
      setCategories(catData);
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
    setFormCategoryId(categories[0]?.id || "");
    setFormPrice("");
    setFormDiscountPrice("");
    setFormStock("");
    setFormImageUrl("");
    setFormDescription("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setSelectedId(product.id);
    setFormName(product.name);
    setFormCategoryId(product.category_id);
    setFormPrice(product.price.toString());
    setFormDiscountPrice(product.discount_price ? product.discount_price.toString() : "");
    setFormStock(product.stock.toString());
    setFormImageUrl(product.image_url || "");
    setFormDescription(product.description || "");
    setFormIsActive(product.is_active);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const res = await apiFetch(`/products/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus produk.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      category_id: formCategoryId,
      name: formName,
      price: parseInt(formPrice) || 0,
      discount_price: formDiscountPrice ? parseInt(formDiscountPrice) || null : null,
      stock: parseInt(formStock) || 0,
      image_url: formImageUrl || null,
      description: formDescription || null,
      is_active: formIsActive
    };

    try {
      const url = modalMode === "create" ? "/products" : `/products/${selectedId}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan data produk.");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Filter products locally
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchCategory = filterCategory === "all" || p.category_id === filterCategory;
    
    const matchStatus = filterStatus === "all" || 
      (filterStatus === "active" && p.is_active) || 
      (filterStatus === "inactive" && !p.is_active);

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 text-primary">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Daftar Produk Buket</h3>
              <p className="text-gray-400 text-xs mt-0.5">Kelola katalog produk buket bunga beserta harga dan stok</p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-150/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs font-bold text-gray-700 cursor-pointer shadow-sm custom-select transition-all"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs font-bold text-gray-700 cursor-pointer shadow-sm custom-select transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif (Tampil)</option>
              <option value="inactive">Nonaktif (Sembunyi)</option>
            </select>
          </div>
        </div>

        {/* Table layout */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat katalog produk...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-semibold max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Foto</th>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => {
                    const categoryName = categories.find((c) => c.id === p.category_id)?.name || "Kategori Terhapus";
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/20 transition-colors">
                        <td className="px-6 py-4">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-xl border border-gray-100 shadow-sm shrink-0"
                            />
                          ) : (
                            <span className="w-10 h-10 bg-gray-100 text-gray-400 flex items-center justify-center rounded-xl border border-gray-100 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          <div>{p.name}</div>
                          <div className="text-[10px] font-mono font-medium text-gray-400 mt-0.5">{p.slug}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-650 capitalize">{categoryName}</td>
                        <td className="px-6 py-4 font-extrabold text-gray-900">
                          {p.discount_price ? (
                            <div className="flex flex-col">
                              <span className="text-primary font-extrabold">{formatRupiah(p.discount_price)}</span>
                              <span className="text-gray-400 text-xs font-semibold line-through">{formatRupiah(p.price)}</span>
                            </div>
                          ) : (
                            <span>{formatRupiah(p.price)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-lg border ${
                            p.stock < 5 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-gray-50 text-gray-600 border-gray-150"
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-green-50 text-green-650 border border-green-100 rounded-lg">
                              <Eye className="w-3.5 h-3.5" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-gray-50 text-gray-500 border border-gray-150 rounded-lg">
                              <EyeOff className="w-3.5 h-3.5" /> Sembunyi
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 text-gray-500 hover:text-primary hover:bg-pink-50/40 rounded-xl transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50/40 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-xs font-semibold">
                      Tidak ada produk ditemukan.
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
              className="bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {modalMode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
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
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Nama Produk</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Buket Mawar Pink"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Kategori</label>
                    <select
                      required
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-bold text-gray-700 cursor-pointer shadow-sm custom-select"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Harga (Rupiah)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Rp"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Harga Diskon (Optional)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Rp"
                      value={formDiscountPrice}
                      onChange={(e) => setFormDiscountPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Stok</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">URL Foto Produk (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/foto.jpg"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Deskripsi Produk (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tulis deskripsi singkat atau detail bunga buket..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 rounded-lg border-gray-350 accent-primary cursor-pointer"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-bold text-gray-650 cursor-pointer select-none">
                    Tampilkan produk di halaman depan toko (Aktif)
                  </label>
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
                      <span>Simpan Produk</span>
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
