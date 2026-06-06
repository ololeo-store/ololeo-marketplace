"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import {
  Settings,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
  Save,
  Eye,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StoreSetting {
  key: string;
  value: string;
  updated_at: string;
}

const PREDEFINED_SETTINGS = [
  { key: "whatsapp_number", label: "Nomor WhatsApp" },
  { key: "shop_address", label: "Alamat Toko" },
  { key: "maps_latitude", label: "Maps Latitude" },
  { key: "maps_longitude", label: "Maps Longitude" },
  { key: "shop_name", label: "Nama Toko" },
  { key: "logo_url", label: "URL Logo Toko" },
  { key: "opening_hours", label: "Jam Operasional Toko" },
  { key: "midtrans_client_key", label: "Midtrans Client Key" },
  { key: "midtrans_server_key", label: "Midtrans Server Key" }
];

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Form states
  const [formKey, setFormKey] = useState("");
  const [formValue, setFormValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/store-settings");
      if (!res.ok) throw new Error("Gagal memuat pengaturan toko.");
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedKey(null);
    const available = PREDEFINED_SETTINGS.filter(
      (p) => !settings.some((s) => s.key === p.key)
    );
    setFormKey(available[0]?.key || "");
    setFormValue("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (setting: StoreSetting) => {
    setModalMode("edit");
    setSelectedKey(setting.key);
    setFormKey(setting.key);
    setFormValue(setting.value);
    setIsModalOpen(true);
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengaturan "${key}"?`)) return;
    try {
      const res = await apiFetch(`/store-settings/${key}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus pengaturan.");
      fetchSettings();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = modalMode === "create" ? "/store-settings" : `/store-settings/${selectedKey}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      // POST requires { key, value }, PATCH only updates { value }
      const payload = modalMode === "create" 
        ? { key: formKey.trim(), value: formValue }
        : { value: formValue };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan pengaturan.");
      }

      setIsModalOpen(false);
      fetchSettings();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSettings = settings.filter((s) => 
    s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-pink-50 text-primary">
              <Settings className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Pengaturan Toko (Store Settings)</h3>
              <p className="text-gray-400 text-xs mt-0.5">Konfigurasi variabel toko seperti kontak WhatsApp, alamat, jam buka, dan konfigurasi API gateway</p>
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
              <span>Tambah Setting</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md bg-gray-50/50 p-2 rounded-2xl border border-gray-150/50">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kunci atau nilai pengaturan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
          />
        </div>

        {/* Listing */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-455">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Memuat pengaturan toko...</p>
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
                  <th className="px-6 py-4">Nama Variabel (Key)</th>
                  <th className="px-6 py-4">Nilai Konfigurasi (Value)</th>
                  <th className="px-6 py-4">Terakhir Diperbarui</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 divide-y divide-gray-100">
                {filteredSettings.length > 0 ? (
                  filteredSettings.map((s) => (
                    <tr key={s.key} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-800 text-xs shrink-0">
                        {s.key}
                      </td>
                      <td className="px-6 py-4 max-w-md font-semibold text-gray-650">
                        <div className="line-clamp-2 break-all whitespace-pre-wrap">{s.value}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs shrink-0">
                        {formatDate(s.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-right shrink-0">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-pink-50/40 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.key)}
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
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs font-semibold">
                      Tidak ada pengaturan ditemukan.
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
              className="bg-white w-full max-w-md rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {modalMode === "create" ? "Tambah Variabel Baru" : "Edit Nilai Konfigurasi"}
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
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Nama Variabel (Key)</span>
                    <span title="Pilih variabel pengaturan toko dari daftar yang tersedia">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </span>
                  </label>
                  {modalMode === "create" ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl outline-none text-xs font-bold text-gray-750 cursor-pointer shadow-sm text-left flex justify-between items-center custom-select"
                      >
                        <span>
                          {PREDEFINED_SETTINGS.find((p) => p.key === formKey)?.label || "-- Pilih Variabel --"}
                        </span>
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl z-20 overflow-hidden py-1 max-h-[160px] overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-top-2">
                          {PREDEFINED_SETTINGS.filter(
                            (p) => !settings.some((s) => s.key === p.key)
                          ).map((p) => (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => {
                                setFormKey(p.key);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-5 py-3 text-xs transition-colors hover:bg-primary/5 cursor-pointer ${
                                formKey === p.key ? "text-primary font-bold bg-primary/5" : "text-gray-750 font-semibold"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                          {PREDEFINED_SETTINGS.filter(
                            (p) => !settings.some((s) => s.key === p.key)
                          ).length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-3 font-semibold">
                              -- Semua pengaturan sudah terisi --
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      disabled
                      value={
                        PREDEFINED_SETTINGS.find((p) => p.key === formKey)?.label || "-"
                      }
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl outline-none text-xs font-bold text-gray-500 shadow-sm"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-455 uppercase tracking-wider">Nilai Konfigurasi (Value)</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Masukkan nilai konfigurasi toko..."
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
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
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Setting</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Store Settings Frontend Live Preview Modal */}
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
              className="bg-white w-full max-w-lg rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 md:p-8 relative z-10 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span>Pratinjau Toko (Frontend Mockup)</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Berikut adalah simulasi tampilan informasi toko Anda di website pembeli</p>
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
                    https://{settings.find((s) => s.key === "shop_name")?.value?.toLowerCase().replace(/\s+/g, "") || "tokomakanan"}.id/kontak
                  </div>
                </div>

                {/* Browser Page Body */}
                <div className="p-5 bg-white space-y-6">
                  {/* Shop Header Area */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      {settings.find((s) => s.key === "logo_url")?.value ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.find((s) => s.key === "logo_url")?.value}
                          alt="Logo Toko"
                          className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-150"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-pink-50 text-primary flex items-center justify-center font-bold text-sm">
                          {settings.find((s) => s.key === "shop_name")?.value?.[0]?.toUpperCase() || "S"}
                        </div>
                      )}
                      <span className="font-extrabold text-sm text-gray-800">
                        {settings.find((s) => s.key === "shop_name")?.value || "Nama Toko Anda"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-primary px-3 py-1 bg-pink-50 rounded-full">
                      Buka Sekarang
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alamat & Maps */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">Alamat Toko</p>
                          <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-0.5">
                            {settings.find((s) => s.key === "shop_address")?.value || "Alamat belum diatur."}
                          </p>
                        </div>
                      </div>

                      {/* Map Graphic Preview */}
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl h-36 relative overflow-hidden flex items-center justify-center shadow-xs">
                        <div
                          className="absolute inset-0 opacity-15 pointer-events-none"
                          style={{
                            backgroundImage: "radial-gradient(#1e40af 1px, transparent 1px)",
                            backgroundSize: "16px 16px"
                          }}
                        ></div>
                        <svg className="absolute inset-0 w-full h-full text-blue-200/50" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0,60 Q120,10 240,60 T480,60" fill="none" stroke="currentColor" strokeWidth="2.5" />
                          <path d="M80,0 Q160,80 180,160" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M280,0 Q240,80 300,160" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <div className="z-10 flex flex-col items-center gap-1 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-blue-100 shadow-md text-center max-w-[85%]">
                          <MapPin className="w-4.5 h-4.5 text-red-500 animate-bounce" />
                          <p className="text-[9px] font-bold text-gray-800 line-clamp-1">
                            {settings.find((s) => s.key === "shop_address")?.value || "Lokasi Toko"}
                          </p>
                          <p className="text-[8px] text-gray-400 font-semibold">
                            Lat: {settings.find((s) => s.key === "maps_latitude")?.value || "0"} | Lng: {settings.find((s) => s.key === "maps_longitude")?.value || "0"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operational & Contact */}
                    <div className="flex flex-col justify-between gap-4">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">Jam Operasional</p>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">
                              {settings.find((s) => s.key === "opening_hours")?.value || "Jam operasional belum diatur."}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">Hubungi WhatsApp</p>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">
                              {settings.find((s) => s.key === "whatsapp_number")?.value || "Nomor WA belum diatur."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Button Preview */}
                      {settings.find((s) => s.key === "whatsapp_number")?.value && (
                        <a
                          href={`https://wa.me/${settings.find((s) => s.key === "whatsapp_number")?.value?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs rounded-xl shadow-md transition-all text-center select-none"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Pesan Langsung via WhatsApp</span>
                        </a>
                      )}
                    </div>
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
