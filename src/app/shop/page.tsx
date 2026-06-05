"use client";

import { useState } from "react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

const categories = ["All", "Romantic", "Graduation", "Birthday", "Valentine", "Custom"];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");

  const filteredProducts = products
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

  return (
    <main className="min-h-screen pt-32 pb-24 bg-gray-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Collections</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Find the perfect flower bucket for your special moments. Beautifully handcrafted with love.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-xl shadow-primary/5 mb-16 border border-primary/10 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 overflow-x-auto w-full lg:w-[460px] pb-4 lg:pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 px-8 py-3.5 rounded-full whitespace-nowrap font-bold transition-all duration-500 snap-start flex items-center justify-center min-w-[140px] ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-primary via-secondary to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white shadow-xl shadow-primary/25 scale-105 ring-4 ring-primary/10"
                    : "bg-gray-50 text-gray-500 hover:text-primary hover:bg-white border border-gray-100 hover:border-primary/30 hover:shadow-md"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search lovely flowers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-full border-2 border-transparent bg-gray-50 focus:bg-white focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>
            
            <div className="relative w-full sm:w-56">
              <button 
                onClick={() => document.getElementById('sortOptions')?.classList.toggle('hidden')}
                className="w-full px-5 py-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-700 flex justify-between items-center shadow-sm"
              >
                <span translate="no">
                  {sortOrder === 'default' && <span key="default">Sort by Price</span>}
                  {sortOrder === 'asc' && <span key="asc">Price: Low to High</span>}
                  {sortOrder === 'desc' && <span key="desc">Price: High to Low</span>}
                </span>
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              </button>
              
              <div id="sortOptions" className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => { setSortOrder('default'); document.getElementById('sortOptions')?.classList.add('hidden'); }}
                  className={`w-full text-left px-5 py-3 hover:bg-primary/5 transition-colors ${sortOrder === 'default' ? 'text-primary font-semibold bg-primary/5' : 'text-gray-700'}`}
                >
                  Default
                </button>
                <button 
                  onClick={() => { setSortOrder('asc'); document.getElementById('sortOptions')?.classList.add('hidden'); }}
                  className={`w-full text-left px-5 py-3 hover:bg-primary/5 transition-colors ${sortOrder === 'asc' ? 'text-primary font-semibold bg-primary/5' : 'text-gray-700'}`}
                >
                  Price: Low to High
                </button>
                <button 
                  onClick={() => { setSortOrder('desc'); document.getElementById('sortOptions')?.classList.add('hidden'); }}
                  className={`w-full text-left px-5 py-3 hover:bg-primary/5 transition-colors ${sortOrder === 'desc' ? 'text-primary font-semibold bg-primary/5' : 'text-gray-700'}`}
                >
                  Price: High to Low
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">🌸</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No flowers found</h3>
            <p className="text-gray-500 text-lg mb-6">Try adjusting your filters or search terms.</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-4 px-8 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
