"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  TrendingUp,
  Eye,
  Users,
  DollarSign,
  ShoppingBag,
  Percent,
  Loader2,
  AlertCircle,
  Calendar,
  Globe,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

interface HistoryData {
  date: string;
  pageviews: number;
  visitors: number;
}

interface SalesData {
  date: string;
  revenue: number;
  count: number;
}

interface ProductStat {
  name: string;
  quantity: number;
}

interface PathStat {
  path: string;
  count: number;
}

interface AnalyticsStats {
  total_pageviews: number;
  unique_visitors: number;
  total_revenue: number;
  total_orders: number;
  conversion_rate: number;
  visitor_history: HistoryData[];
  sales_history: SalesData[];
  top_products: ProductStat[];
  page_paths: PathStat[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/analytics/dashboard");
      if (!res.ok) throw new Error("Gagal memuat data analitik.");
      const stats = await res.json();
      setData(stats);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil statistik.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // 1. Custom SVG Line Chart for Traffic
  const renderTrafficChart = (history: HistoryData[]) => {
    if (!history || history.length === 0) return null;
    const maxVal = Math.max(...history.map((h) => Math.max(h.pageviews, h.visitors, 10)));
    const padding = 40;
    const chartWidth = 500;
    const chartHeight = 200;

    const pointsPageviews = history.map((h, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (history.length - 1);
      const y = chartHeight - padding - (h.pageviews / maxVal) * (chartHeight - padding * 2);
      return `${x},${y}`;
    }).join(" ");

    const pointsVisitors = history.map((h, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (history.length - 1);
      const y = chartHeight - padding - (h.visitors / maxVal) * (chartHeight - padding * 2);
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[9px] font-bold fill-gray-400"
                >
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          <polyline
            fill="none"
            stroke="url(#pageviewGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsPageviews}
          />
          <polyline
            fill="none"
            stroke="url(#visitorGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsVisitors}
          />

          {/* Horizontal Labels */}
          {history.map((h, index) => {
            const x = padding + (index * (chartWidth - padding * 2)) / (history.length - 1);
            return (
              <text
                key={index}
                x={x}
                y={chartHeight - padding + 18}
                textAnchor="middle"
                className="text-[9px] font-bold fill-gray-400"
              >
                {h.date.split(" ")[0]} {/* Show weekday */}
              </text>
            );
          })}

          {/* Definitions for gradients */}
          <defs>
            <linearGradient id="pageviewGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="visitorGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  // 2. Custom SVG Bar Chart for Revenue
  const renderRevenueChart = (sales: SalesData[]) => {
    if (!sales || sales.length === 0) return null;
    const maxVal = Math.max(...sales.map((s) => s.revenue), 100000);
    const padding = 50;
    const chartWidth = 500;
    const chartHeight = 200;
    const barWidth = 22;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[8px] font-bold fill-gray-400"
                >
                  {ratio === 0 ? "Rp 0" : `Rp ${(ratio * maxVal) / 1000}k`}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {sales.map((s, index) => {
            const x = padding + (index * (chartWidth - padding * 2)) / (sales.length - 1) - barWidth / 2;
            const height = (s.revenue / maxVal) * (chartHeight - padding * 2);
            const y = chartHeight - padding - height;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(height, 2)}
                  rx="6"
                  fill="url(#revenueBarGrad)"
                  className="transition-all hover:opacity-80 cursor-pointer"
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding + 18}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-gray-400"
                >
                  {s.date.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* Definitions */}
          <defs>
            <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white dark:bg-card p-6 md:p-8 rounded-3xl border border-gray-200/60 dark:border-border shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 dark:bg-primary/10 text-primary">
              <TrendingUp className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Web Analytics & Trafik</h3>
              <p className="text-gray-400 dark:text-muted-foreground text-xs mt-0.5">Analisis perilaku pelanggan, statistik kunjungan, serta performa penjualan toko</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="p-2 text-gray-400 dark:text-muted-foreground hover:text-primary hover:bg-pink-50/50 dark:hover:bg-primary/10 rounded-xl transition-all"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-455 dark:text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Menganalisis data aktivitas web...</p>
          </div>
        ) : error || !data ? (
          <div className="py-12 text-center text-red-500 dark:text-red-400 font-semibold max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>{error || "Gagal memuat data."}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-5 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Pageviews</span>
                  <span className="p-2 rounded-xl bg-pink-50 dark:bg-primary/10 text-primary">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-gray-800 dark:text-foreground">{data.total_pageviews}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Total klik halaman</p>
                </div>
              </div>

              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-5 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Pengunjung</span>
                  <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-gray-800 dark:text-foreground">{data.unique_visitors}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Pengunjung unik (IP)</p>
                </div>
              </div>

              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-5 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Pendapatan</span>
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-gray-850 truncate">{formatRupiah(data.total_revenue)}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Dari transaksi sukses</p>
                </div>
              </div>

              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-5 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Konversi</span>
                  <span className="p-2 rounded-xl bg-purple-50 dark:bg-secondary/10 text-purple-500 dark:text-primary">
                    <Percent className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-gray-800 dark:text-foreground">{data.conversion_rate}%</h4>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Rasio order dibanding visitor</p>
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traffic Chart */}
              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-foreground">Tren Kunjungan Website (7 Hari)</h4>
                    <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Perbandingan pageviews & pengunjung unik</p>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 dark:text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 dark:bg-primary" /> Pageviews
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Visitor
                    </span>
                  </div>
                </div>
                {renderTrafficChart(data.visitor_history)}
              </div>

              {/* Revenue Chart */}
              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-6 rounded-3xl space-y-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-foreground">Performa Penjualan & Omset (7 Hari)</h4>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Statistik pendapatan harian dalam rupiah</p>
                </div>
                {renderRevenueChart(data.sales_history)}
              </div>
            </div>

            {/* Detailed tables grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Pages path counts */}
              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-gray-50 dark:bg-muted text-gray-500 dark:text-muted-foreground">
                    <Globe className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-foreground">Halaman Paling Sering Dikunjungi</h4>
                    <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Top path link yang dibuka customer</p>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {data.page_paths.length > 0 ? (
                    data.page_paths.map((p, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-750">
                          <span className="font-mono text-gray-700 dark:text-muted-foreground">{p.path}</span>
                          <span>{p.count} Views</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${Math.min((p.count / (data.total_pageviews || 1)) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-gray-400 dark:text-muted-foreground py-6">Belum ada data kunjungan.</p>
                  )}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white dark:bg-card border border-gray-150 dark:border-border p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 dark:text-yellow-400">
                    <Award className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-foreground">Produk Terlaris (Top Selling)</h4>
                    <p className="text-[10px] text-gray-400 dark:text-muted-foreground font-semibold mt-0.5">Produk paling banyak dipesan pelanggan</p>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {data.top_products.length > 0 ? (
                    data.top_products.map((p, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-750">
                          <span>{p.name}</span>
                          <span>{p.quantity} Unit Terjual</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min((p.quantity / (data.total_orders || 1)) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-gray-400 dark:text-muted-foreground py-6">Belum ada pesanan sukses.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
