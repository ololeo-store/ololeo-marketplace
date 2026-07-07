"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product, useCart } from "@/store/useCart";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const setIsOpen = useCart((state) => state.setIsOpen);
  const [justAdded, setJustAdded] = useState(false);

  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  // Cart charges the discounted price when one is active, not the struck-out original
  const cartProduct = hasDiscount ? { ...product, price: product.discountPrice! } : product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartProduct);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartProduct);
    setIsOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group w-full flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="flex flex-col w-full">
        {/* Foto Kotak (Square Image) */}
        <div className="relative aspect-square overflow-hidden w-full bg-gray-50 dark:bg-muted rounded-2xl border border-gray-100/50 dark:border-border">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Category badge */}
          {product.category && (
            <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold bg-white/90 dark:bg-card/90 backdrop-blur-sm text-purple-500 dark:text-foreground shadow-sm">
                {product.category}
              </span>
            </div>
          )}
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm">
                {discountPercent}% Off
              </span>
            </div>
          )}
        </div>

        {/* Text info below image */}
        <div className="pt-3 pb-2 flex-grow">
          <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-foreground line-clamp-1 group-hover:text-pink-500 dark:hover:text-primary dark:group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {hasDiscount ? (
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <p className="text-base md:text-lg font-extrabold text-red-600 dark:text-red-500">
                <span translate="no">Rp {product.discountPrice!.toLocaleString("id-ID")}</span>
              </p>
              <span className="text-xs md:text-sm font-semibold text-gray-400 dark:text-muted-foreground line-through">
                <span translate="no">Rp {product.price.toLocaleString("id-ID")}</span>
              </span>
            </div>
          ) : (
            <p className="mt-1 text-base md:text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary">
              <span translate="no">Rp {product.price.toLocaleString("id-ID")}</span>
            </p>
          )}
        </div>
      </Link>

      {/* Two side-by-side buttons */}
      <div className="hidden md:flex gap-2 mt-1">
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-2 px-2 text-xs md:text-sm font-semibold rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 ${
            justAdded
              ? "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-[0_4px_12px_rgba(167,139,250,0.3)] animate-pulse"
              : "bg-white dark:bg-card border-gray-200 dark:border-border text-gray-800 dark:text-foreground hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {justAdded ? "Added!" : "Add to Cart"}
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 py-2 px-2 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-md hover:shadow-primary/30 transition-all text-center"
        >
          Buy Now
        </button>
      </div>
    </motion.div>
  );
}
