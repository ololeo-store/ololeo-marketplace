"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  DollarSign,
  Layers,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { apiFetch } from "../../../utils/api";

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch products, categories, and orders in parallel using apiFetch
        const [prodRes, catRes, ordRes] = await Promise.all([
          apiFetch("/products"),
          apiFetch("/categories"),
          apiFetch("/orders"),
        ]);

        if (!prodRes.ok || !catRes.ok || !ordRes.ok) {
          throw new Error("Gagal mengambil data statistik dari server.");
        }

        const products = await prodRes.json();
        const categories = await catRes.json();
        const orders = await ordRes.json();

        // Calculate stats
        const paidOrders = orders.filter((o: Order) => o.payment_status === "paid");
        const totalRevenue = paidOrders.reduce((sum: number, o: Order) => sum + o.total_price, 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          totalCategories: categories.length,
        });

        // Set recent 5 orders
        setRecentOrders(orders.slice(0, 5));
      } catch (err: any) {
        setError(err.message || "Gagal memuat data dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
            <TrendingUp className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    return status.toLowerCase() === "paid" ? (
      <span className="px-2.5 py-1 text-xs font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 rounded-lg">
        Lunas
      </span>
    ) : (
      <span className="px-2.5 py-1 text-xs font-bold bg-gray-50 dark:bg-muted text-gray-500 dark:text-muted-foreground border border-gray-150 dark:border-border rounded-lg">
        Belum Bayar
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border" />
          ))}
        </div>
        <div className="h-96 bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-3xl p-6 text-center font-semibold max-w-lg mx-auto">
        <p className="mb-2">Terjadi Kesalahan</p>
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatRupiah(stats.totalRevenue),
      icon: DollarSign,
      color: "from-green-400/20 to-emerald-400/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "from-blue-400/20 to-indigo-400/20 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Products Catalog",
      value: stats.totalProducts,
      icon: Award,
      color: "from-pink-400/20 dark:from-secondary to-rose-400/20 text-pink-600 dark:text-primary",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: Layers,
      color: "from-purple-400/20 dark:from-secondary to-violet-400/20 dark:to-primary text-violet-600 dark:text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              key={card.title}
              className="bg-white dark:bg-card p-5 sm:p-6 rounded-3xl border border-gray-200/60 dark:border-border shadow-sm flex items-center justify-between gap-4 w-full min-w-0"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-gray-400 dark:text-muted-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider block truncate">
                  {card.title}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-foreground truncate">{card.value}</h3>
              </div>
              <span className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-tr shrink-0 ${card.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white dark:bg-card rounded-3xl border border-gray-200/60 dark:border-border shadow-sm overflow-hidden"
      >
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 dark:border-border">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Pesanan Terbaru</h3>
            <p className="text-gray-400 dark:text-muted-foreground text-xs mt-0.5">Pantau dan kelola pesanan masuk terakhir</p>
          </div>
          <Link
            href="/sapanyak/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span>Semua Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-muted text-gray-400 dark:text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-border">
                <th className="px-8 py-4">Customer</th>
                <th className="px-6 py-4">Total Bayar</th>
                <th className="px-6 py-4">Status Pesanan</th>
                <th className="px-6 py-4">Status Pembayaran</th>
                <th className="px-8 py-4 text-right">Tanggal Order</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-gray-700 dark:text-muted-foreground divide-y divide-gray-100 dark:divide-border">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 dark:hover:bg-muted transition-colors">
                    <td className="px-8 py-4">
                      <div className="font-bold text-gray-800 dark:text-foreground">
                        {order.customer?.name || "Guest Customer"}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-muted-foreground mt-0.5">
                        {order.customer?.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-850">
                      {formatRupiah(order.total_price)}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4">{getPaymentBadge(order.payment_status)}</td>
                    <td className="px-8 py-4 text-right text-xs text-gray-400 dark:text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-400 dark:text-muted-foreground">
                    Belum ada data pesanan masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
