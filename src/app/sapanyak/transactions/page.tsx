"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  category: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formType, setFormType] = useState("income");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const [txRes, sumRes] = await Promise.all([
        apiFetch(`/financial-transactions?${params.toString()}`),
        apiFetch("/financial-transactions/summary")
      ]);

      if (!txRes.ok || !sumRes.ok) {
        throw new Error("Gagal mengambil data transaksi keuangan.");
      }

      const txData = await txRes.json();
      const sumData = await sumRes.json();

      setTransactions(txData);
      setSummary(sumData);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, filterCategory, startDate, endDate]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedId(null);
    setFormType("income");
    setFormAmount("");
    setFormCategory("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setModalMode("edit");
    setSelectedId(tx.id);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormDate(new Date(tx.date).toISOString().split("T")[0]);
    setFormDescription(tx.description || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    try {
      const res = await apiFetch(`/financial-transactions/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus transaksi.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      type: formType,
      amount: parseInt(formAmount),
      category: formCategory,
      date: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
      description: formDescription || null
    };

    try {
      const url = modalMode === "create" ? "/financial-transactions" : `/financial-transactions/${selectedId}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan data transaksi.");

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

  // Local Search filtering (client side on top of database query filtering)
  const filteredTransactions = transactions.filter((t) => {
    const term = searchQuery.toLowerCase();
    return (
      t.category.toLowerCase().includes(term) ||
      (t.description && t.description.toLowerCase().includes(term))
    );
  });

  // Unique categories for filtering
  const categoriesList = Array.from(new Set(transactions.map((t) => t.category)));

  return (
    <div className="space-y-8 font-sans">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center justify-between gap-4 w-full min-w-0"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider block truncate">Total Pemasukan</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 truncate">{formatRupiah(summary.totalIncome)}</h3>
          </div>
          <span className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center justify-between gap-4 w-full min-w-0"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider block truncate">Total Pengeluaran</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-rose-600 truncate">{formatRupiah(summary.totalExpense)}</h3>
          </div>
          <span className="p-3 sm:p-3.5 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center justify-between gap-4 w-full min-w-0"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider block truncate">Saldo Bersih</span>
            <h3 className={`text-xl sm:text-2xl font-extrabold truncate ${summary.balance >= 0 ? "text-primary" : "text-rose-600"}`}>
              {formatRupiah(summary.balance)}
            </h3>
          </div>
          <span className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50 text-primary shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </motion.div>
      </div>

      {/* Main Table and Filter Wrapper */}
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Catatan Transaksi Keuangan</h3>
            <p className="text-gray-400 text-xs mt-0.5">Kelola data pemasukan dan pengeluaran operasional toko</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 bg-gray-50/50 p-4 rounded-2xl border border-gray-150/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs font-bold text-gray-700 cursor-pointer shadow-sm custom-select transition-all"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pemasukan (Income)</option>
              <option value="expense">Pengeluaran (Expense)</option>
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs font-bold text-gray-700 cursor-pointer shadow-sm custom-select transition-all"
            >
              <option value="all">Semua Kategori</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400 w-4 h-4 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-650 cursor-pointer shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400 w-4 h-4 shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-650 cursor-pointer shadow-sm"
            />
          </div>
        </div>

        {/* Table view */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat transaksi...</p>
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
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 divide-y divide-gray-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-6 py-4.5">
                        {tx.type === "income" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-650 border border-emerald-100 rounded-lg">
                            Pemasukan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-650 border border-rose-100 rounded-lg">
                            Pengeluaran
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-gray-800 font-bold capitalize">{tx.category}</td>
                      <td className={`px-6 py-4.5 font-extrabold ${tx.type === "income" ? "text-emerald-650" : "text-rose-650"}`}>
                        {tx.type === "income" ? "+" : "-"} {formatRupiah(tx.amount)}
                      </td>
                      <td className="px-6 py-4.5 text-xs text-gray-500 font-normal max-w-xs truncate">
                        {tx.description || "-"}
                      </td>
                      <td className="px-6 py-4.5 text-xs text-gray-400">
                        {new Date(tx.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-pink-50/40 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50/40 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs font-semibold">
                      Tidak ada data transaksi ditemukan.
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
                  {modalMode === "create" ? "Tambah Transaksi Baru" : "Edit Catatan Transaksi"}
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
                    <label className="text-xs font-bold text-gray-450 uppercase tracking-wider">Tipe Transaksi</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormType("income")}
                        className={`py-3 rounded-2xl font-bold text-xs border text-center transition-all cursor-pointer ${
                          formType === "income"
                            ? "bg-emerald-550 border-emerald-550 text-white shadow-md shadow-emerald-500/10"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Pemasukan
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType("expense")}
                        className={`py-3 rounded-2xl font-bold text-xs border text-center transition-all cursor-pointer ${
                          formType === "expense"
                            ? "bg-rose-550 border-rose-550 text-white shadow-md shadow-rose-500/10"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Pengeluaran
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-450 uppercase tracking-wider">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Nominal (Rupiah)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Contoh: 150000"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Kategori</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: sales, operasional, gaji"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm capitalize"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Deskripsi / Keterangan</label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan deskripsi atau keterangan tambahan..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
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
                      <span>Simpan Transaksi</span>
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
