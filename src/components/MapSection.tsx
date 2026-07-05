"use client";

import { motion } from "framer-motion";

export default function MapSection() {
  return (
    <section className="py-24 bg-gray-50 bg-gradient-to-t from-primary/5 to-transparent dark:bg-none dark:bg-muted relative">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-foreground mb-4">
            Find <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Us</span>
          </h2>
          <p className="text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto text-lg">
            Come and see our beautiful flower arrangements in person. We'd love to help you find the perfect bucket.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white h-[400px] md:h-[500px] w-full max-w-5xl mx-auto bg-white dark:bg-card flex flex-col relative group"
        >
          {/* Overlay link in case iframe gets blocked by Google X-Frame-Options */}
          <a href="https://maps.app.goo.gl/Cy6gwRFfrFjZBxDo7" target="_blank" rel="noreferrer" className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-6 py-3 bg-white dark:bg-card text-gray-900 dark:text-foreground rounded-full font-bold shadow-lg">Buka di Google Maps</span>
          </a>
          
          <iframe
            src="https://maps.google.com/maps?q=-6.874477,107.542047&z=15&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale group-hover:grayscale-0 transition-all duration-700 flex-1"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
