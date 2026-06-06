"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../../../utils/api";
import {
  MessageSquare,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  Smartphone,
  Globe,
  User,
  Calendar,
  X,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender: string; // "user" or "ai" / "assistant"
  message_text: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  user_id: string | null;
  platform: string;
  external_session_id: string | null;
  last_intent: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    name: string | null;
    email: string | null;
  } | null;
}

interface SessionDetail extends ChatSession {
  ai_chat_messages: ChatMessage[];
}

export default function AIChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const res = await apiFetch("/ai-chat-sessions");
      if (!res.ok) throw new Error("Gagal memuat daftar sesi chat.");
      const data = await res.json();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchSessionDetail = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await apiFetch(`/ai-chat-sessions/${id}`);
      if (!res.ok) throw new Error("Gagal memuat detail percakapan.");
      const data = await res.json();
      setSelectedSession(data);
    } catch (err: any) {
      alert(err.message || "Gagal memuat detail chat.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat percakapan sesi ini?")) return;
    try {
      const res = await apiFetch(`/ai-chat-sessions/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus sesi chat.");
      
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
      fetchSessions();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data.");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedSession]);

  const filteredSessions = sessions.filter((s) => {
    const userLabel = s.users?.name || "Guest / Pelanggan";
    const intentLabel = s.last_intent || "";
    const platformLabel = s.platform || "";
    const query = searchQuery.toLowerCase();
    
    return userLabel.toLowerCase().includes(query) ||
      intentLabel.toLowerCase().includes(query) ||
      platformLabel.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query);
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "whatsapp":
      case "wa":
        return <Smartphone className="w-3.5 h-3.5 text-green-500" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/60 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-pink-50 text-primary">
            <MessageSquare className="w-6 h-6 fill-primary/10" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Riwayat Percakapan AI</h3>
            <p className="text-gray-400 text-xs mt-0.5">Pantau interaksi asisten chatbot AI dengan pelanggan Anda</p>
          </div>
        </div>

        {error ? (
          <div className="py-12 text-center text-red-500 font-semibold max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[580px] items-stretch">
            {/* Session Sidebar Panel */}
            <div className="border border-gray-150 rounded-2xl flex flex-col bg-gray-50/20 overflow-hidden h-[580px]">
              <div className="p-4 border-b border-gray-150 shrink-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari sesi chat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-700 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                {isLoadingList ? (
                  <div className="py-12 text-center text-gray-400 text-xs font-semibold">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading sesi...
                  </div>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((s) => {
                    const isActive = selectedSession?.id === s.id;
                    const userName = s.users?.name || "Guest / Pelanggan";
                    return (
                      <div
                        key={s.id}
                        onClick={() => fetchSessionDetail(s.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex justify-between items-start gap-2 ${
                          isActive
                            ? "bg-white border-primary/40 shadow-sm ring-1 ring-primary/20"
                            : "bg-white border-gray-150/70 hover:border-gray-200 hover:shadow-xs"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-md bg-gray-50 border border-gray-150 shrink-0">
                              {getPlatformIcon(s.platform)}
                            </span>
                            <span className="font-bold text-xs text-gray-800 truncate block">
                              {userName}
                            </span>
                          </div>
                          
                          {s.last_intent && (
                            <p className="text-[10px] text-primary font-bold bg-pink-50/50 border border-pink-100/50 px-1.5 py-0.5 rounded-md inline-block max-w-full truncate">
                              Intent: {s.last_intent}
                            </p>
                          )}
                          
                          <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-300" />
                            {formatDate(s.created_at)}
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-gray-400 text-xs font-semibold">
                    Tidak ada sesi percakapan.
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Messages Panel */}
            <div className="lg:col-span-2 border border-gray-150 rounded-2xl flex flex-col bg-white overflow-hidden h-[580px]">
              {selectedSession ? (
                <div className="flex flex-col h-full">
                  {/* Active Header */}
                  <div className="p-4 border-b border-gray-150 bg-gray-50/30 flex items-center justify-between shrink-0">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-xs text-gray-800 truncate">
                        {selectedSession.users?.name || "Guest / Pelanggan"}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold truncate">
                        Sesi ID: <span className="font-mono text-[9px]">{selectedSession.id}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSession(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages Bubble Container */}
                  <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-gray-50/30 space-y-4 scrollbar-thin">
                    {isLoadingDetail ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                        Memuat riwayat chat...
                      </div>
                    ) : selectedSession.ai_chat_messages && selectedSession.ai_chat_messages.length > 0 ? (
                      selectedSession.ai_chat_messages.map((m) => {
                        const isUser = m.sender === "user";
                        return (
                          <div
                            key={m.id}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? "bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none shadow-sm shadow-primary/10 font-semibold"
                                  : "bg-white border border-gray-150/80 text-gray-700 rounded-tl-none font-medium"
                              }`}
                            >
                              <p className="whitespace-pre-line">{m.message_text}</p>
                              <p
                                className={`text-[9px] mt-1.5 text-right ${
                                  isUser ? "text-pink-100" : "text-gray-400"
                                }`}
                              >
                                {formatDate(m.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs font-semibold">
                        Belum ada pesan terkirim dalam sesi ini.
                      </div>
                    )}
                    <div ref={messageEndRef} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 space-y-3">
                  <MessageSquare className="w-12 h-12 text-gray-200 stroke-[1.5]" />
                  <p className="text-xs font-semibold">Pilih chat session untuk melihat riwayat percakapan</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
