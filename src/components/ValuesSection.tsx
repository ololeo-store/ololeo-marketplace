"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, Sparkles, Wand2, Diamond } from "lucide-react";

export default function ValuesSection() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  const values = [
    {
      id: 1,
      title: "Handmade",
      icon: <Heart className="w-8 h-8" />,
      content: "Dibuat langsung dengan tangan untuk memastikan kualitas terbaik."
    },
    {
      id: 2,
      title: "Aesthetic",
      icon: <Sparkles className="w-8 h-8" />,
      content: "Desain kekinian dengan palet warna lembut, cocok untuk pajangan estetik."
    },
    {
      id: 3,
      title: "Custom",
      icon: <Wand2 className="w-8 h-8" />,
      content: "Pilih sendiri pita, bunga, hingga pesan kartu ucapan Anda."
    },
    {
      id: 4,
      title: "Premium",
      icon: <Diamond className="w-8 h-8" />,
      content: "Menggunakan kertas premium tebal dan elegan yang tidak mudah lecek."
    }
  ];

  return (
    <section className="py-24 bg-gray-50/50 dark:bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-foreground mb-6">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Value</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-muted-foreground">Klik gambar amplop di bawah ini untuk membuka pesan dari kami.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-24 max-w-6xl mx-auto pt-10">
          {values.map((value) => {
            const isOpen = openCard === value.id;
            
            return (
              <div 
                key={value.id} 
                className="relative w-full"
                onClick={() => setOpenCard(isOpen ? null : value.id)}
              >
                {/* Envelope Body */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: value.id * 0.1 }}
                  className="bg-white dark:bg-card rounded-[2rem] rounded-tl-sm shadow-xl shadow-primary/5 border border-primary/10 flex flex-col items-center justify-center p-8 cursor-pointer relative z-20 h-56 hover:shadow-primary/20 transition-shadow duration-300 group"
                >
                  <div className="absolute top-0 right-0 left-0 border-t-8 border-primary/10 rounded-t-3xl" />
                  
                  <div className={`p-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:bg-none dark:bg-primary/10 text-primary mb-4 transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-foreground">{value.title}</h3>
                  <span className="text-sm text-primary/60 mt-2 font-medium">{isOpen ? "Klik untuk Menutup" : "Buka Pesan"}</span>
                </motion.div>

                {/* Letter Content popping out */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 0, scale: 0.95 }}
                      animate={{ opacity: 1, y: -70, scale: 1 }}
                      exit={{ opacity: 0, y: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="absolute left-4 right-4 bg-pink-50/90 dark:bg-primary/10 backdrop-blur-sm pt-6 pb-20 px-6 rounded-2xl shadow-lg border border-pink-100 dark:border-primary/20 z-10 top-0 pointer-events-none"
                    >
                      <p className="text-gray-700 dark:text-muted-foreground text-sm leading-relaxed text-center font-medium">{value.content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
