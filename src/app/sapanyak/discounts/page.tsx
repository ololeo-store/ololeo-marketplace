"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  Percent,
  Plus,
  Search,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Discount {
  id: string;
  product_id: string;
  discount_type: string; // "percentage" or "fixed"
  value: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  products?: Product;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formProductId, setFormProductId] = useState("");
  const [formType, setFormType] = useState("percentage"); // percentage or fixed
  const [formValue, setFormValue] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [discRes, prodRes] = await Promise.all([
        apiFetch("/discounts"),
        apiFetch("/products")
      ]);

      if (!discRes.ok || !prodRes.ok) throw new Error("Gagal mengambil data diskon/produk.");

      const discData = await discRes.json();
      const prodData = await prodRes.json();

      setDiscounts(discData);
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
    setFormProductId(products[0]?.id || "");
    setFormType("percentage");
    setFormValue("");
    
    // Set default start time to now and end time to tomorrow
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format to datetime-local input string YYYY-MM-DDTHH:MM
    const formatDateTimeLocal = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
      return adjustedDate.toISOString().slice(0, 16);
    };

    setFormStartTime(formatDateTimeLocal(now));
    setFormEndTime(formatDateTimeLocal(tomorrow));
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus aturan diskon ini?")) return;
    try {
      const res = await apiFetch(`/discounts/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus diskon.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      product_id: formProductId,
      discount_type: formType,
      value: parseInt(formValue) || 0,
      start_time: new Date(formStartTime).toISOString(),
      end_time: new Date(formEndTime).toISOString(),
      is_active: formIsActive
    };

    try {
      const res = await apiFetch("/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan diskon.");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to determine status
  const getDiscountStatus = (d: Discount) => {
    if (!d.is_active) return { label: "Nonaktif", color: "bg-gray-50 dark:bg-muted text-gray-500 dark:text-muted-foreground border-gray-150 dark:border-border" };
    const now = new Date();
    const start = new Date(d.start_time);
    const end = new Date(d.end_time);

    if (now < start) {
      return { label: "Menunggu", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20" };
    } else if (now > end) {
      return { label: "Kedaluwarsa", color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20" };
    } else {
      return { label: "Aktif", color: "bg-green-50 dark:bg-green-500/10 text-green-650 dark:text-green-400 border-green-100 dark:border-green-500/20" };
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredDiscounts = discounts.filter((d) => {
    const product = products.find((p) => p.id === d.product_id);
    const productName = product?.name || "Produk Terhapus";
    return productName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-200/60 dark:border-border shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 dark:bg-primary/10 text-primary">
              <Percent className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Manajemen Diskon Produk</h3>
              <p className="text-gray-400 dark:text-muted-foreground text-xs mt-0.5">Atur potongan harga khusus produk buket dengan penjadwalan tanggal & jam aktif</p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Diskon</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md bg-gray-50/50 dark:bg-muted p-2 rounded-2xl border border-gray-150/50 dark:border-border">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Cari diskon berdasarkan produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-455 dark:text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat aturan diskon...</p>
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
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Potongan Diskon</th>
                  <th className="px-6 py-4">Waktu Mulai</th>
                  <th className="px-6 py-4">Waktu Selesai</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 dark:text-muted-foreground divide-y divide-gray-100 dark:divide-border">
                {filteredDiscounts.length > 0 ? (
                  filteredDiscounts.map((d) => {
                    const product = products.find((p) => p.id === d.product_id);
                    const status = getDiscountStatus(d);
                    return (
                      <tr key={d.id} className="hover:bg-gray-50/20 dark:hover:bg-muted transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-foreground">
                          {product ? product.name : "Produk Terhapus"}
                          {product && (
                            <span className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold ml-2">
                              ({formatRupiah(product.price)})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-pink-50 dark:bg-primary/10 text-primary border border-pink-100 dark:border-primary/20 rounded-lg">
                            <Tag className="w-3.5 h-3.5" />
                            {d.discount_type === "percentage" ? `${d.value}% Off` : `${formatRupiah(d.value)} Off`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-muted-foreground font-semibold text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-300 dark:text-muted-foreground" />
                            {formatDateTime(d.start_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-muted-foreground font-semibold text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-300 dark:text-muted-foreground" />
                            {formatDateTime(d.end_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right shrink-0">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-2 text-gray-400 dark:text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/40 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-muted-foreground text-xs font-semibold">
                      Tidak ada diskon produk aktif.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
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
                <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Terapkan Diskon Baru</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-muted-foreground rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Pilih Produk</label>
                  <select
                    required
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatRupiah(p.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Tipe Potongan</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select"
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal Flat (Rp)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Nilai Potongan</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={formType === "percentage" ? "%" : "Rp"}
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Tanggal & Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Tanggal & Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 rounded-lg border-gray-350 accent-primary cursor-pointer"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-bold text-gray-650 dark:text-muted-foreground cursor-pointer select-none">
                    Status Aktif (Apply immediately)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3.5 bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-150 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                  >
                    Batal (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-2xl shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      <span>Apply Diskon</span>
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
