"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  // Hardcoded random positions for aesthetic petals to avoid hydration mismatch
  const petals = [
    { id: 1, size: "w-3 h-3", left: "10%", top: "20%", delay: 0, duration: 4, color: "bg-pink-300" },
    { id: 2, size: "w-2 h-2", left: "85%", top: "15%", delay: 1, duration: 5, color: "bg-purple-300" },
    { id: 3, size: "w-4 h-4", left: "25%", top: "70%", delay: 2, duration: 6, color: "bg-pink-400" },
    { id: 4, size: "w-2 h-2", left: "75%", top: "60%", delay: 0.5, duration: 4.5, color: "bg-white" },
    { id: 5, size: "w-3 h-3", left: "50%", top: "10%", delay: 1.5, duration: 5.5, color: "bg-pink-300" },
    { id: 6, size: "w-2 h-2", left: "90%", top: "80%", delay: 3, duration: 4, color: "bg-purple-200" },
    { id: 7, size: "w-3 h-3", left: "15%", top: "45%", delay: 2.5, duration: 5, color: "bg-white" },
    { id: 8, size: "w-4 h-4", left: "65%", top: "30%", delay: 1, duration: 6, color: "bg-pink-500" },
    { id: 9, size: "w-2 h-2", left: "5%", top: "85%", delay: 0, duration: 4.5, color: "bg-purple-300" },
    { id: 10, size: "w-3 h-3", left: "40%", top: "85%", delay: 2, duration: 5, color: "bg-pink-300" },
    { id: 11, size: "w-2 h-2", left: "80%", top: "40%", delay: 1.5, duration: 5.5, color: "bg-white" },
    { id: 12, size: "w-3 h-3", left: "30%", top: "30%", delay: 0.5, duration: 4, color: "bg-purple-400" },
  ];

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-primary/20">
      {/* Pink Cloud Background from Unsplash */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 opacity-60"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=2000&auto=format&fit=crop")',
        }}
      />
      
      {/* Pink Gradient to White Fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white via-white/80 to-transparent z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent -z-10 mix-blend-multiply" />

      {/* Floating Petals/Dots Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ y: 0, opacity: 0.3 }}
            animate={{ 
              y: [-20, 20, -20],
              x: [-15, 15, -15],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 90, 180]
            }}
            transition={{
              duration: petal.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: petal.delay
            }}
            className={`absolute ${petal.size} ${petal.color} rounded-full blur-[2px] opacity-60`}
            style={{ left: petal.left, top: petal.top }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight mb-8">
              Send <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Happiness</span> <br/>
              in Every Bloom
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
              Beautiful handcrafted flower buckets for every moment. We carefully select the freshest flowers to express your feelings perfectly.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link 
                href="/shop" 
                className="px-10 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 inline-flex items-center gap-2 shadow-xl"
              >
                Shop Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
