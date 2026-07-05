"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CreditCard,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Payment {
  id: string;
  order_id: string;
  transaction_id: string;
  status: string;
  amount: number;
  payment_type: string;
  raw_payload: string;
  created_at: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
  } | null;
  total_price: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Detail Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Creation Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formOrderId, setFormOrderId] = useState("");
  const [formTrxId, setFormTrxId] = useState("");
  const [formStatus, setFormStatus] = useState("success");
  const [formAmount, setFormAmount] = useState("");
  const [formType, setFormType] = useState("bank_transfer");
  const [formRawPayload, setFormRawPayload] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [payRes, ordRes] = await Promise.all([
        apiFetch("/payments"),
        apiFetch("/orders")
      ]);

      if (!payRes.ok || !ordRes.ok) throw new Error("Gagal mengambil data pembayaran.");

      const payData = await payRes.json();
      const ordData = await ordRes.json();

      setPayments(payData);
      setOrders(ordData);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const handleOpenCreate = () => {
    setFormOrderId(orders[0]?.id || "");
    setFormTrxId(`MANUAL-${Date.now()}`);
    setFormStatus("success");
    setFormAmount("");
    setFormType("bank_transfer");
    setFormRawPayload(JSON.stringify({ payment_method: "manual_input", note: "Recorded by admin" }, null, 2));
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan pembayaran ini?")) return;
    try {
      const res = await apiFetch(`/payments/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus pembayaran.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      order_id: formOrderId,
      transaction_id: formTrxId,
      status: formStatus,
      amount: parseInt(formAmount) || 0,
      payment_type: formType,
      raw_payload: formRawPayload
    };

    try {
      const res = await apiFetch("/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal merekam pembayaran.");
      }

      setIsCreateOpen(false);
      fetchData();
      alert("Pembayaran berhasil direkam!");
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "settlement":
        return (
          <span className="inline-flex px-2.5 py-1 text-xs font-bold bg-green-50 dark:bg-green-500/10 text-green-650 dark:text-green-400 border border-green-100 dark:border-green-500/20 rounded-lg shrink-0">
            Success
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex px-2.5 py-1 text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 rounded-lg shrink-0">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2.5 py-1 text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-650 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 rounded-lg shrink-0">
            Failed
          </span>
        );
    }
  };

  // Filter payments list
  const filteredPayments = payments.filter((p) => {
    const matchSearch = p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payment_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = filterStatus === "all" || p.status === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-200/60 dark:border-border shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 dark:bg-primary/10 text-primary">
              <Receipt className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Catatan Pembayaran</h3>
              <p className="text-gray-400 dark:text-muted-foreground text-xs mt-0.5">Kelola verifikasi pembayaran masuk dari payment gateway</p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Record Pembayaran</span>
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-muted p-4 rounded-2xl border border-gray-150/50 dark:border-border">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Cari transaksi, ID order, tipe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select transition-all"
            >
              <option value="all">Semua Status Bayar</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450 dark:text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat transaksi pembayaran...</p>
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
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">ID Order</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Tipe Bayar</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 dark:text-muted-foreground divide-y divide-gray-100 dark:divide-border">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/20 dark:hover:bg-muted transition-colors">
                      <td className="px-6 py-4.5 font-bold text-gray-800 dark:text-foreground">{p.transaction_id}</td>
                      <td className="px-6 py-4.5 text-xs text-gray-500 dark:text-muted-foreground font-mono select-all">{p.order_id}</td>
                      <td className="px-6 py-4.5 font-extrabold text-gray-900 dark:text-foreground">{formatRupiah(p.amount)}</td>
                      <td className="px-6 py-4.5 uppercase font-bold text-gray-650 dark:text-muted-foreground text-xs">{p.payment_type}</td>
                      <td className="px-6 py-4.5">{getStatusBadge(p.status)}</td>
                      <td className="px-6 py-4.5 text-xs text-gray-400 dark:text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(p)}
                            className="p-2.5 bg-gray-50 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:text-primary hover:bg-pink-50/40 dark:hover:bg-primary/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Payload</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-gray-400 dark:text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/40 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-muted-foreground text-xs font-semibold">
                      Tidak ada catatan pembayaran ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payload Details Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-card w-full max-w-2xl rounded-3xl border border-gray-100 dark:border-border shadow-2xl p-6 md:p-8 relative z-10 max-h-[85vh] flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Raw Payload Inspector</h3>
                  <p className="text-[10px] font-mono text-gray-400 dark:text-muted-foreground mt-0.5">Trx ID: {selectedPayment.transaction_id}</p>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-muted-foreground rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* JSON Prettifier */}
              <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-900 p-5 font-mono text-xs text-green-400 border border-gray-800 scrollbar-thin select-all leading-relaxed min-h-[300px]">
                <div className="flex items-center gap-2 border-b border-gray-850 pb-3 mb-4 shrink-0 text-[10px] text-gray-450 dark:text-muted-foreground font-bold uppercase tracking-wider">
                  <Code className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <span>Gateway Response JSON</span>
                </div>
                <pre className="whitespace-pre-wrap">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedPayment.raw_payload), null, 2);
                    } catch (e) {
                      return selectedPayment.raw_payload;
                    }
                  })()}
                </pre>
              </div>

              <div className="flex justify-end pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-6 py-3.5 bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-150 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Tutup Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Record Payment Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-card w-full max-w-lg rounded-3xl border border-gray-100 dark:border-border shadow-2xl p-6 md:p-8 relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Record Pembayaran Manual</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-muted-foreground rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Pilih Order ID</label>
                  <select
                    required
                    value={formOrderId}
                    onChange={(e) => {
                      setFormOrderId(e.target.value);
                      // Auto populate order total price
                      const selected = orders.find((o) => o.id === e.target.value);
                      if (selected) setFormAmount(selected.total_price.toString());
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select"
                  >
                    {orders.filter(o => o.id).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.customer?.name || "Guest"} - {formatRupiah(o.total_price)} ({o.id.substring(0, 8)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Transaction ID</label>
                    <input
                      type="text"
                      required
                      value={formTrxId}
                      onChange={(e) => setFormTrxId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Tipe Pembayaran</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select"
                    >
                      <option value="bank_transfer">Transfer Bank</option>
                      <option value="cash">Cash / Tunai</option>
                      <option value="qris">QRIS / E-Wallet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Nominal Bayar</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Rp"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-semibold text-gray-700 dark:text-muted-foreground shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select"
                    >
                      <option value="success">Success</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground uppercase tracking-wider">Raw Payload / Catatan JSON</label>
                  <textarea
                    rows={3}
                    value={formRawPayload}
                    onChange={(e) => setFormRawPayload(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-mono text-gray-700 dark:text-muted-foreground shadow-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
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
                      <span>Simpan Catatan</span>
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
