"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { products as staticProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Loader2, ChevronDown } from "lucide-react";
import { api, ApiProduct, ApiProductCategory } from "@/lib/api";
import { Product } from "@/store/useCart";

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);

  // Map API product to local Product interface
  const mapApiProduct = useCallback((p: ApiProduct): Product => {
    const firstImage = p.galleries?.[0]?.imageUrl;
    return {
      id: p.id,
      name: p.name,
      price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
      discountPrice:
        p.discountPrice !== null && p.discountPrice !== undefined
          ? typeof p.discountPrice === "string" ? parseFloat(p.discountPrice) : p.discountPrice
          : null,
      stock: p.stock ?? 0,
      image: firstImage || "/placeholder.svg",
      category: p.category?.name || "Uncategorized",
      description: p.description || "",
    };
  }, []);

  // Fetch products and categories from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts({ limit: 100 }),
          api.getCategories(),
        ]);

        // Handle products - could be paginated or array
        let apiProducts: ApiProduct[] = [];
        if (Array.isArray(productsRes)) {
          apiProducts = productsRes;
        } else if (productsRes && 'data' in productsRes) {
          apiProducts = (productsRes as any).data || productsRes as any;
        } else {
          apiProducts = productsRes as any;
        }

        // Handle categories
        let cats: string[] = ["All"];
        if (Array.isArray(categoriesRes)) {
          cats = ["All", ...categoriesRes.map((c: ApiProductCategory) => c.name)];
        }

        if (apiProducts.length > 0) {
          setProducts(apiProducts.map(mapApiProduct));
          setCategories(cats);
          setUseApi(true);
        } else {
          // Fallback to static data
          setProducts(staticProducts);
          const uniqueCategories = ["All", ...new Set(staticProducts.map(p => p.category))];
          setCategories(uniqueCategories);
          setUseApi(false);
        }
      } catch {
        // Fallback to static data on API error
        setProducts(staticProducts);
        const uniqueCategories = ["All", ...new Set(staticProducts.map(p => p.category))];
        setCategories(uniqueCategories);
        setUseApi(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [mapApiProduct]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === "asc") return a.price - b.price;
        if (sortOrder === "desc") return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, activeCategory, sortOrder]);

  // Get recommendations (e.g. 4 random or top products from all products list)
  const recommendations = useMemo(() => {
    if (products.length === 0) return [];
    // Just select up to 4 items from the products list
    return products.slice(0, 4);
  }, [products]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-sort-dropdown]")) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <main className="min-h-screen pt-6 pb-24 bg-gradient-to-b from-pink-50/30 dark:from-background to-white dark:to-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-foreground mb-4">
              Temukan Buket{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary">
                Impianmu
              </span>
            </h1>
            <p className="text-gray-500 dark:text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Handcrafted with love untuk setiap momen spesialmu ≽^•⩊•^≼
            </p>
          </motion.div>
        </div>

        {/* Large Wrapper Card */}
        <div className="bg-white dark:bg-card rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-border shadow-sm shadow-pink-100/10">
          {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 md:mb-10"
        >
          {/* Search + Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari buket kesukaanmu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card focus:bg-white dark:focus:bg-card focus:outline-none focus:border-pink-300 dark:focus:border-primary/40 focus:ring-2 focus:ring-pink-100 dark:focus:ring-primary/20 transition-all text-sm font-medium text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative w-full sm:w-48" data-sort-dropdown>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card hover:border-pink-200 dark:hover:border-primary/25 transition-all text-sm font-medium text-gray-600 dark:text-muted-foreground flex justify-between items-center"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {sortOrder === "default" && "Urutkan"}
                  {sortOrder === "asc" && "Termurah"}
                  {sortOrder === "desc" && "Termahal"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl z-10 overflow-hidden py-1"
                  >
                    {[
                      { value: "default", label: "Default" },
                      { value: "asc", label: "Harga: Termurah" },
                      { value: "desc", label: "Harga: Termahal" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortOrder(opt.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortOrder === opt.value
                            ? "text-pink-500 dark:text-primary font-semibold bg-pink-50 dark:bg-primary/10"
                            : "text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Category Pills (hidden on desktop) */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 snap-start ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary text-white shadow-md shadow-pink-200/50"
                    : "bg-white dark:bg-card text-gray-500 dark:text-muted-foreground border border-gray-200 dark:border-border hover:border-pink-200 dark:hover:border-primary/25 hover:text-pink-500 dark:hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar - Categories (Desktop Only) */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-24 py-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-muted-foreground mb-4 px-3">
                Kategori
              </h2>
              <div className="flex flex-col gap-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      activeCategory === category
                        ? "text-pink-500 dark:text-primary bg-pink-50/60 dark:bg-primary/10 font-black"
                        : "text-gray-600 dark:text-muted-foreground hover:text-pink-500 dark:hover:text-primary hover:bg-pink-50/20 dark:hover:bg-primary/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content - Grid of Products */}
          <div className="flex-grow">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-pink-400 dark:text-primary animate-spin mb-4" />
                <p className="text-sm text-gray-400 dark:text-muted-foreground font-medium">Memuat produk...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border"
              >
                <div className="text-5xl mb-4">🌸</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-foreground mb-2">
                  Tidak ada produk ditemukan
                </h3>
                <p className="text-gray-400 dark:text-muted-foreground text-sm mb-6">
                  Coba ubah filter atau kata kunci pencarian kamu
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="px-6 py-2.5 rounded-full border-2 border-pink-300 dark:border-primary/30 text-pink-500 dark:text-primary hover:bg-pink-50 dark:hover:bg-primary/10 font-semibold text-sm transition-colors"
                >
                  Reset Filter
                </button>
              </motion.div>
            ) : (
              /* Product Grid (4 Buckets per row on desktop) */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Results count */}
            {!isLoading && filteredProducts.length > 0 && (
              <p className="text-center md:text-left text-xs text-gray-400 dark:text-muted-foreground mt-8 font-medium">
                Menampilkan {filteredProducts.length} produk
                {!useApi && " (offline mode)"}
              </p>
            )}
          </div>
        </div>

        {/* Recommendation Section Below */}
        {!isLoading && recommendations.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-100 dark:border-border">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-foreground mb-8 flex items-center gap-2">
              <span>╰┈➤</span> Rekomendasi Untukmu
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recommendations.map((product) => (
                <ProductCard key={`rec-${product.id}`} product={product} />
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </main>
  );
}
