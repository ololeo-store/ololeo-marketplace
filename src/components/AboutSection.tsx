"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AboutSection() {
  const [formData, setFormData] = useState({ name: "", message: "" });

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    
    const text = `Halo Ololeo Bucket,\n\nNama saya ${formData.name}.\n${formData.message}`;
    const encodedMessage = encodeURIComponent(text);
    window.open(`https://wa.me/6288809482113?text=${encodedMessage}`, "_blank");
  };

  return (
    <section className="py-24 bg-white dark:bg-card relative overflow-hidden" id="contact">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-bl-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-secondary/5 rounded-tr-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 md:px-6 z-10 relative">

        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col gap-8"
          >
            <div className="text-center mb-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-foreground mb-6">
                Hubungi <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Kami</span>
              </h2>
            </div>
          
            <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/10 border border-gray-100 dark:border-border relative overflow-hidden text-center">
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Punya Pertanyaan Spesial?</h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-8">Pesan custom bucket impian Anda, cukup beri tahu kami lewat WhatsApp!</p>
              
              <form onSubmit={handleWhatsAppSend} className="space-y-5 text-left max-w-xl mx-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-muted-foreground mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama Anda..."
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium bg-gray-50 dark:bg-muted focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-muted-foreground mb-2">Pesan</label>
                  <textarea 
                    placeholder="Misal: Halo kak, saya mau tanya bucket ukuran besar untuk wisuda..."
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium bg-gray-50 dark:bg-muted focus:bg-white outline-none resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-1"
                >
                  <Send className="w-5 h-5" />
                  Kirim via WhatsApp
                </button>
              </form>
            </div>

            {/* Social Media Links */}
            <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-md shadow-primary/5 border border-gray-100 dark:border-border flex flex-col sm:flex-row items-center gap-4 justify-center">
              <span className="font-semibold text-gray-700 dark:text-muted-foreground">Follow us:</span>
              <Link href="https://instagram.com/ololeo.bucket" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-primary/10 text-pink-600 dark:text-primary rounded-full hover:bg-pink-100 dark:hover:bg-primary/15 transition-colors font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                @ololeo.bucket
              </Link>
              <Link href="https://tiktok.com/@ololeo.bucket" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground rounded-full hover:bg-gray-200 dark:hover:bg-muted transition-colors font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/></svg>
                @ololeo.bucket
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
