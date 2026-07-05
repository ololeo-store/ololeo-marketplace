"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  ShoppingBag,
  Search,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  User,
  Phone,
  Calendar,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
  products: Product;
}

interface Customer {
  name: string;
  phone: string;
}

interface Order {
  id: string;
  customer_id: string | null;
  customer: Customer | null;
  pickup_date: string;
  notes: string | null;
  total_price: number;
  status: string;
  payment_status: string;
  payment_token: string | null;
  payment_url: string | null;
  whatsapp_sent: boolean;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  // Details Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Status Update state inside modal
  const [statusVal, setStatusVal] = useState("");
  const [paymentVal, setPaymentVal] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/orders");
      if (!res.ok) throw new Error("Gagal mengambil data pesanan.");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setStatusVal(order.status);
    setPaymentVal(order.payment_status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      const res = await apiFetch(`/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusVal,
          payment_status: paymentVal
        })
      });

      if (!res.ok) throw new Error("Gagal mengupdate status pesanan.");

      // Refresh current details
      const updatedOrder = await res.json();
      setSelectedOrder(updatedOrder);
      
      // Refresh list
      fetchData();
      alert("Status pesanan berhasil diperbarui!");
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) return;
    try {
      const res = await apiFetch(`/orders/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus pesanan.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
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
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shrink-0">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 shrink-0">
            <XCircle className="w-3.5 h-3.5" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-605 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" /> Diproses
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    return status.toLowerCase() === "paid" ? (
      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-lg shrink-0">
        Lunas
      </span>
    ) : (
      <span className="px-2.5 py-1 text-xs font-bold bg-gray-50 dark:bg-muted text-gray-500 dark:text-muted-foreground border border-gray-150 dark:border-border rounded-lg shrink-0">
        Belum Bayar
      </span>
    );
  };

  // Filter local orders list
  const filteredOrders = orders.filter((o) => {
    const custName = o.customer?.name || "Guest Customer";
    const custPhone = o.customer?.phone || "";
    
    const matchSearch = custName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      custPhone.includes(searchQuery) ||
      o.id.includes(searchQuery);

    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchPayment = filterPayment === "all" || o.payment_status === filterPayment;

    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-200/60 dark:border-border shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-pink-50 dark:bg-primary/10 text-primary">
            <ShoppingBag className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Daftar Transaksi Pesanan</h3>
            <p className="text-gray-400 dark:text-muted-foreground text-xs mt-0.5">Kelola pesanan masuk bunga buket dan update status pengerjaan</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-muted p-4 rounded-2xl border border-gray-150/50 dark:border-border">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama, telp, atau ID order..."
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
              <option value="all">Semua Status Pesanan</option>
              <option value="pending">Pending</option>
              <option value="processing">Diproses</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select transition-all"
            >
              <option value="all">Semua Status Bayar</option>
              <option value="paid">Lunas (Paid)</option>
              <option value="unpaid">Belum Bayar (Unpaid)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450 dark:text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat daftar pesanan...</p>
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
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Waktu Pengambilan</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status Pesanan</th>
                  <th className="px-6 py-4">Status Bayar</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 dark:text-muted-foreground divide-y divide-gray-100 dark:divide-border">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/20 dark:hover:bg-muted transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-gray-800 dark:text-foreground">{o.customer?.name || "Guest Customer"}</div>
                        <div className="text-xs text-gray-450 dark:text-muted-foreground mt-0.5">{o.customer?.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-gray-600 dark:text-muted-foreground">
                        {new Date(o.pickup_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4.5 font-extrabold text-gray-900 dark:text-foreground">{formatRupiah(o.total_price)}</td>
                      <td className="px-6 py-4.5">{getStatusBadge(o.status)}</td>
                      <td className="px-6 py-4.5">{getPaymentBadge(o.payment_status)}</td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(o)}
                            className="p-2.5 bg-gray-50 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:text-primary hover:bg-pink-50/40 dark:hover:bg-primary/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                          <button
                            onClick={() => handleDelete(o.id)}
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-muted-foreground text-xs font-semibold">
                      Tidak ada pesanan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Status Edit Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
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
              className="bg-white dark:bg-card w-full max-w-2xl rounded-3xl border border-gray-100 dark:border-border shadow-2xl p-6 md:p-8 relative z-10 max-h-[90vh] overflow-y-auto scrollbar-thin space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Detail Pesanan</h3>
                  <p className="text-[10px] font-mono text-gray-400 dark:text-muted-foreground mt-0.5">ID: {selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-muted-foreground rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-muted p-5 rounded-2xl border border-gray-150/40 dark:border-border">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Informasi Customer</h4>
                  <div className="space-y-2 text-xs font-semibold text-gray-750">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400 dark:text-muted-foreground shrink-0" />
                      <span>{selectedOrder.customer?.name || "Guest Customer"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-muted-foreground shrink-0" />
                      <span>{selectedOrder.customer?.phone || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-muted-foreground shrink-0" />
                      <span>
                        Pickup:{" "}
                        {new Date(selectedOrder.pickup_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Catatan Tambahan</h4>
                  <div className="flex gap-2 text-xs font-semibold text-gray-700 dark:text-muted-foreground bg-white dark:bg-card p-3.5 rounded-xl border border-gray-150/55 dark:border-border min-h-[70px]">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-muted-foreground shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium italic">
                      {selectedOrder.notes || "Tidak ada catatan tambahan."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider pl-1">Daftar Item Buket</h4>
                <div className="border border-gray-150/80 dark:border-border rounded-2xl overflow-hidden bg-white dark:bg-card">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/55 dark:bg-muted text-gray-450 dark:text-muted-foreground font-bold uppercase tracking-wider border-b border-gray-150 dark:border-border">
                        <th className="px-4 py-3">Nama Produk</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3">Harga Satuan</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-border font-semibold text-gray-700 dark:text-muted-foreground">
                      {selectedOrder.order_items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3.5 font-bold text-gray-800 dark:text-foreground">{item.products?.name || "Produk Terhapus"}</td>
                          <td className="px-4 py-3.5 text-center">{item.quantity}</td>
                          <td className="px-4 py-3.5">{formatRupiah(item.price_at_order)}</td>
                          <td className="px-4 py-3.5 text-right font-extrabold text-primary">
                            {formatRupiah(item.price_at_order * item.quantity)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50/30 dark:bg-muted font-extrabold text-sm border-t border-gray-150 dark:border-border text-gray-800 dark:text-foreground">
                        <td colSpan={3} className="px-4 py-4 text-right">Total Tagihan:</td>
                        <td className="px-4 py-4 text-right text-primary text-base font-extrabold">
                          {formatRupiah(selectedOrder.total_price)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Update Status form */}
              <form onSubmit={handleUpdateStatus} className="border-t border-gray-100 dark:border-border pt-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider pl-1">Moderasi Status Pesanan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground">Status Pengerjaan</label>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Diproses (Processing)</option>
                      <option value="completed">Selesai (Completed)</option>
                      <option value="cancelled">Dibatalkan (Cancelled)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 dark:text-muted-foreground">Status Pembayaran</label>
                    <select
                      value={paymentVal}
                      onChange={(e) => setPaymentVal(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-muted-foreground cursor-pointer shadow-sm custom-select"
                    >
                      <option value="unpaid">Belum Bayar (Unpaid)</option>
                      <option value="paid">Lunas (Paid)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3.5 bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-150 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-2xl shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
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
