"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Layers,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RawMaterial {
  id: string;
  name: string;
  stock: number;
  unit: string;
  price_per_unit: number;
  created_at: string;
}

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/raw-materials");
      if (!res.ok) throw new Error("Gagal mengambil data bahan baku.");
      const data = await res.json();
      setMaterials(data);
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
    setFormStock("");
    setFormUnit("");
    setFormPrice("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: RawMaterial) => {
    setModalMode("edit");
    setSelectedId(material.id);
    setFormName(material.name);
    setFormStock(material.stock.toString());
    setFormUnit(material.unit);
    setFormPrice(material.price_per_unit.toString());
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bahan baku ini?")) return;
    try {
      const res = await apiFetch(`/raw-materials/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus bahan baku.");
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
      stock: parseInt(formStock) || 0,
      unit: formUnit,
      price_per_unit: parseInt(formPrice) || 0
    };

    try {
      const url = modalMode === "create" ? "/raw-materials" : `/raw-materials/${selectedId}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan data bahan baku.");

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

  // Filter logic
  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalValuation = materials.reduce((sum, m) => sum + m.stock * m.price_per_unit, 0);
  const totalItemsCount = materials.length;
  const lowStockCount = materials.filter((m) => m.stock < 5).length;

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
            <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider block truncate">Nilai Aset Bahan Baku</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 truncate">{formatRupiah(totalValuation)}</h3>
          </div>
          <span className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50 text-primary shrink-0">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center justify-between gap-4 w-full min-w-0"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider block truncate">Jumlah Jenis Bahan</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 truncate">{totalItemsCount} item</h3>
          </div>
          <span className="p-3 sm:p-3.5 rounded-2xl bg-pink-50 text-secondary shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center justify-between gap-4 w-full min-w-0"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider block truncate">Perlu Restock (&lt; 5)</span>
            <h3 className={`text-xl sm:text-2xl font-extrabold truncate ${lowStockCount > 0 ? "text-amber-600 animate-pulse" : "text-gray-800"}`}>
              {lowStockCount} item
            </h3>
          </div>
          <span className={`p-3 sm:p-3.5 rounded-2xl shrink-0 ${lowStockCount > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"}`}>
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </motion.div>
      </div>

      {/* Main Table Wrapper */}
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Inventaris Bahan Baku</h3>
            <p className="text-gray-400 text-xs mt-0.5">Kelola data stok kertas wrap, pita, bunga, kardus, dll</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/15 hover:shadow-primary/25 transition-all cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan Baku</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama bahan baku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
          />
        </div>

        {/* Table representation */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-450">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat bahan baku...</p>
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
                  <th className="px-6 py-4">Nama Bahan</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Unit / Satuan</th>
                  <th className="px-6 py-4">Harga Satuan</th>
                  <th className="px-6 py-4">Total Aset</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 divide-y divide-gray-100">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((m) => {
                    const isLow = m.stock < 5;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/20 transition-colors">
                        <td className="px-6 py-4.5 font-bold text-gray-800">{m.name}</td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold rounded-lg border ${
                            isLow
                              ? "bg-rose-50 text-rose-650 border-rose-100 animate-pulse"
                              : "bg-gray-50 text-gray-750 border-gray-150"
                          }`}>
                            {m.stock} {isLow && "(Hampir Habis)"}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-gray-500 capitalize">{m.unit}</td>
                        <td className="px-6 py-4.5 font-semibold text-gray-800">{formatRupiah(m.price_per_unit)}</td>
                        <td className="px-6 py-4.5 font-extrabold text-primary">{formatRupiah(m.stock * m.price_per_unit)}</td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-2 text-gray-500 hover:text-primary hover:bg-pink-50/40 rounded-xl transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs font-semibold">
                      Tidak ada bahan baku ditemukan.
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
                  {modalMode === "create" ? "Tambah Bahan Baku Baru" : "Edit Data Bahan Baku"}
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
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Nama Bahan Baku</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kertas Wrap Pink, Pita Hitam"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Stok Awal</label>
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

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Satuan / Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="pcs, meter, roll"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Harga per Satuan</label>
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
                      <span>Simpan Bahan</span>
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
