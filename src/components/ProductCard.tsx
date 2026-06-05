"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/store/useCart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/80 backdrop-blur-md px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-semibold text-secondary">
            {product.category}
          </div>
        </div>
        <div className="p-3 md:p-5">
          <h3 className="text-sm md:text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 md:mt-2 text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            <span translate="no">Rp {product.price.toLocaleString("id-ID")}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
