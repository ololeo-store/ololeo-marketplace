"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const galleryImages = [
  "/mashmallow.webp",
  "/valentinecustom.webp",
  "/moneybucket.webp",
  "/roko.webp"
];

export default function GallerySection() {
  return (
    <section className="py-24 bg-white dark:bg-card overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-foreground mb-4">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Gallery</span>
          </h2>
          <p className="text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto text-lg">
            A glimpse into our beautiful creations designed to bring joy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative aspect-square rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
            >
              <Image 
                src={src}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
