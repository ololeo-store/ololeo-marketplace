"use client";

import { use } from "react";
import Image from "next/image";
import { products as staticProducts } from "@/data/products";
import { notFound } from "next/navigation";
import { useCart, Product } from "@/store/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowLeft, Heart, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

import CheckoutDrawer from "@/components/CheckoutDrawer";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const res = await api.getProduct(unwrappedParams.id);
        if (res) {
          const firstImage = res.galleries?.[0]?.imageUrl;
          setProduct({
            id: res.id,
            name: res.name,
            price: typeof res.price === "string" ? parseFloat(res.price) : res.price,
            discountPrice:
              res.discountPrice !== null && res.discountPrice !== undefined
                ? typeof res.discountPrice === "string" ? parseFloat(res.discountPrice) : res.discountPrice
                : null,
            image: firstImage || "/placeholder.svg",
            category: res.category?.name || "Uncategorized",
            description: res.description || "",
          });
          setCategoryId(res.category?.id || null);
        } else {
          // Fallback to static
          const staticP = staticProducts.find((p) => p.id === unwrappedParams.id);
          setProduct(staticP || null);
        }
      } catch (err) {
        // Fallback to static
        const staticP = staticProducts.find((p) => p.id === unwrappedParams.id);
        setProduct(staticP || null);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [unwrappedParams.id]);

  useEffect(() => {
    if (!categoryId) return;
    async function loadRelated() {
      try {
        const res = await api.getProducts({ categoryId: categoryId!, excludeId: unwrappedParams.id, limit: 4 });
        const mapped = (res?.data || []).map((p) => {
          const firstImage = p.galleries?.[0]?.imageUrl;
          return {
            id: p.id,
            name: p.name,
            price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
            discountPrice:
              p.discountPrice !== null && p.discountPrice !== undefined
                ? typeof p.discountPrice === "string" ? parseFloat(p.discountPrice) : p.discountPrice
                : null,
            image: firstImage || "/placeholder.svg",
            category: p.category?.name || "Uncategorized",
            description: p.description || "",
          };
        });
        setRelatedProducts(mapped);
      } catch (err) {
        setRelatedProducts([]);
      }
    }
    loadRelated();
  }, [categoryId, unwrappedParams.id]);

  // Mobile layout state variables
  const colors = ["#d6bcfd", "#7dd3fc", "#f472b6", "#fed7aa"]; // Purple, Blue, Pink, Apricot
  const [selectedColor, setSelectedColor] = useState(0);
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const [selectedSize, setSelectedSize] = useState("L");
  const [isFavorite, setIsFavorite] = useState(false);

  // Flower Particle State
  interface FlowerParticle {
    id: number;
    originX: number;
    originY: number;
    destX: number;
    destY: number;
    emoji: string;
    rotation: number;
    scale: number;
  }
  const flowerEmojis = ["🌸", "🌹", "🌷", "🌼", "🌺", "💐"];
  const [particles, setParticles] = useState<FlowerParticle[]>([]);

  const triggerFlowerPop = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = e.clientX || (rect.left + rect.width / 2);
    const originY = e.clientY || (rect.top + rect.height / 2);

    const newParticles: FlowerParticle[] = Array.from({ length: 12 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 45 + Math.random() * 85;
      return {
        id: Math.random(),
        originX,
        originY,
        destX: Math.cos(angle) * distance,
        destY: Math.sin(angle) * distance - 30,
        emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
        rotation: Math.random() * 180 - 90,
        scale: 0.6 + Math.random() * 0.8,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Automatically clean up particles after animation completes
    setTimeout(() => {
      setParticles((prev) => prev.filter((part) => !newParticles.find((np) => np.id === part.id)));
    }, 850);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-card">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 dark:border-primary"></div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const cartProduct = hasDiscount ? { ...product, price: product.discountPrice! } : product;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerFlowerPop(e);
    addItem(cartProduct, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleCheckoutNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerFlowerPop(e);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (_id: string, q: number) => {
    setQuantity(Math.max(1, q));
  };

  return (
    <main className="min-h-screen pt-0 md:pt-8 pb-0 md:pb-24 bg-white dark:bg-card relative overflow-hidden">
      {/* Checkout Drawer for Direct Buy */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={[{ ...cartProduct, quantity }]}
        title="Checkout Pesanan"
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Flower Particles Animation Layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: p.originX,
                y: p.originY,
                scale: 0.2,
                opacity: 1,
                rotate: 0
              }}
              animate={{
                x: p.originX + p.destX,
                y: p.originY + p.destY,
                scale: p.scale,
                opacity: 0,
                rotate: p.rotation
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.1, 0.8, 0.3, 1]
              }}
              className="absolute text-3xl select-none"
              style={{
                left: 0,
                top: 0,
                marginLeft: "-18px",
                marginTop: "-18px",
              }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute top-20 right-0 w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      {/* Desktop View */}
      <div className="hidden md:block container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-muted-foreground hover:text-primary transition-colors mb-10 font-medium"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-muted flex items-center justify-center border border-gray-100 dark:border-border">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span>Back to Shop</span>
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full max-w-xl mx-auto"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/50 backdrop-blur-sm">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm w-fit mb-6 shadow-sm border border-primary/20 tracking-wide uppercase">
              {product.category}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-foreground mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 flex-wrap mb-8">
              {hasDiscount ? (
                <div className="text-3xl lg:text-4xl font-extrabold text-red-600 dark:text-red-500 inline-block">
                  <span translate="no">Rp {product.discountPrice!.toLocaleString("id-ID")}</span>
                </div>
              ) : (
                <div className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block">
                  <span translate="no">Rp {product.price.toLocaleString("id-ID")}</span>
                </div>
              )}
              {hasDiscount && (
                <span className="text-lg lg:text-xl font-semibold text-gray-400 dark:text-muted-foreground line-through">
                  <span translate="no">Rp {product.price.toLocaleString("id-ID")}</span>
                </span>
              )}
              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  {discountPercent}% Off
                </span>
              )}
            </div>

            <div className="prose prose-lg text-gray-600 dark:text-muted-foreground mb-12 bg-gray-50 dark:bg-muted p-6 rounded-3xl border border-gray-100 dark:border-border">
              <p className="leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-gray-100/60 dark:bg-muted backdrop-blur-sm p-1.5 rounded-full border border-gray-200 dark:border-border w-fit mb-6">
              <button
                onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                className="w-10 h-10 rounded-full bg-white dark:bg-card shadow-sm flex items-center justify-center text-gray-600 dark:text-muted-foreground active:scale-95 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-gray-800 dark:text-foreground text-base">{quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center active:scale-95 transition-transform hover:bg-secondary hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-row gap-3 md:gap-4 mt-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 md:py-5 rounded-full font-bold text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 border-2 ${isAdded
                  ? "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-[0_10px_25px_rgba(167,139,250,0.45)] animate-pulse"
                  : "bg-white dark:bg-card text-gray-800 dark:text-foreground border-gray-200 dark:border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
              >
                <span className="shrink-0 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                </span>
                {isAdded ? (
                  <span key="added">Added!</span>
                ) : (
                  <span key="add-to-cart">Add to Cart</span>
                )}
              </button>

              <button
                onClick={handleCheckoutNow}
                className="flex-[1.2] py-4 md:py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm md:text-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        </div>

        {/* You May Like */}
        <div className="mt-20 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-6">You May Like</h2>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-muted-foreground italic">
              Belum ada produk lain di kategori ini.
            </p>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden relative z-10 min-h-screen">
        {/* Soft Background Gradient Container */}
        <div className="bg-gradient-to-b from-secondary/15 via-primary/10 to-transparent pt-6 pb-8 px-4 flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-4">
            <Link
              href="/shop"
              className="w-11 h-11 bg-white/90 dark:bg-card backdrop-blur-md rounded-full shadow-sm flex items-center justify-center border border-white/20 active:scale-95 transition-transform text-gray-800 dark:text-foreground hover:text-primary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-poppins font-semibold text-lg text-gray-800 dark:text-foreground">Details</span>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-11 h-11 bg-white/90 dark:bg-card backdrop-blur-md rounded-full shadow-sm flex items-center justify-center border border-white/20 active:scale-95 transition-transform text-gray-800 dark:text-foreground"
            >
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-secondary text-secondary" : "text-gray-400 dark:text-muted-foreground"}`} />
            </button>
          </div>

          {/* Product Image */}
          <div className="relative w-full max-w-[280px] aspect-square my-4 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/50 backdrop-blur-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Details Glass Card */}
        <div className="w-full bg-white/70 dark:bg-card backdrop-blur-xl border-t border-x border-white/40 rounded-t-[2.5rem] px-4 pt-8 pb-32 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] relative -mt-4 flex flex-col gap-6">
          {/* Title & Stepper Row */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-grow">
              <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">{product.category}</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground leading-tight">{product.name}</h1>
            </div>
            {/* Stepper */}
            <div className="flex items-center gap-3 bg-gray-100/60 dark:bg-muted backdrop-blur-sm p-1 rounded-full border border-white/50 shrink-0">
              <button
                onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 rounded-full bg-white dark:bg-card shadow-sm flex items-center justify-center text-gray-600 dark:text-muted-foreground active:scale-95 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-semibold text-gray-800 dark:text-foreground text-sm">{quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center active:scale-95 transition-transform hover:bg-secondary hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 dark:text-muted-foreground font-medium uppercase tracking-wide">Price</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={hasDiscount ? "text-2xl font-bold text-red-600 dark:text-red-500" : "text-2xl font-bold text-gray-900 dark:text-foreground"}>
                Rp {(hasDiscount ? product.discountPrice! : product.price).toLocaleString("id-ID")}
              </span>
              {hasDiscount && (
                <span className="text-sm font-semibold text-gray-400 dark:text-muted-foreground line-through">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  {discountPercent}% Off
                </span>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">Description</span>
            <div className="bg-white/40 dark:bg-card border border-white/50 rounded-2xl p-5 shadow-sm backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-gray-600 dark:text-muted-foreground font-medium">{product.description}</p>
            </div>
          </div>

          {/* You May Like */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">You May Like</span>
            {relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-muted-foreground italic">
                Belum ada produk lain di kategori ini.
              </p>
            )}
          </div>

          {/* Back to Shop Link */}
          <div className="flex justify-center mt-2 pb-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-muted-foreground hover:text-primary active:scale-95 transition-all font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shop</span>
            </Link>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-transparent px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,16px))] flex gap-4 pointer-events-none">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-4 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 border-2 pointer-events-auto shadow-lg shadow-gray-200/50 ${isAdded
              ? "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-[0_10px_25px_rgba(167,139,250,0.45)]"
              : "bg-white dark:bg-card text-gray-800 dark:text-foreground border-white hover:bg-gray-50 dark:hover:bg-muted"
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {isAdded ? "Added!" : "Add to Cart"}
          </button>
          <button
            onClick={handleCheckoutNow}
            className="flex-[1.2] py-4 rounded-3xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm flex items-center justify-center gap-2 pointer-events-auto shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
}