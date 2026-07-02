"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function IntroSection() {
  return (
    <section className="py-24 bg-white overflow-hidden" id="intro">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full flex justify-center lg:justify-end"
          >
            <div className="relative aspect-square sm:aspect-[4/5] w-[80%] max-w-[280px] sm:max-w-[320px] lg:max-w-md mx-auto lg:mx-0 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[6px] md:border-8 border-white group transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image 
                src="/valentinebesar.webp"
                alt="Beautiful Flowers"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex-1 w-full text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Menghadirkan Kebahagiaan dalam Setiap <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Rangkaian Bunga.</span>
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              <p>
                Ololeo Bucket hadir berawal dari sebuah passion sederhana: melihat senyum tulus mengembang saat seseorang menerima buket bunga. Kami percaya bahwa bunga bukan sekadar pajangan, melainkan perantara pesan yang tak mampu diungkapkan.
              </p>
              <p>
                Setiap bunga yang kami rangkai diproses dengan penuh hati, menggunakan bunga cantik yang dirangkai secara teliti. Dari hari ulang tahun, momen wisuda, perayaan <i>anniversary</i>, hingga kejutan tak terduga — kami di sini untuk mengabadikannya.
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-10 inline-block"
            >
              <a href="/shop" className="px-8 py-4 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg inline-flex">
                Lihat Koleksi Kami
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
