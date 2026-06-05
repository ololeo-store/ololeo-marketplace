"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
export default function Preloader() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    // Only show once per session to not annoy the user
    const hasSeenPreloader = sessionStorage.getItem("hasSeenPreloader");
    if (!hasSeenPreloader) {
      setIsLoading(true);
      // Auto dismiss after 2.2 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("hasSeenPreloader", "true");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isLoading]);
  if (!isMounted) return null;
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Aesthetic Blur Glow Background Effects */}
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
          {/* Bloom Animation Container */}
          <div className="relative flex flex-col items-center justify-center mb-8">
            {/* Center blooming circle */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, ease: "easeOut", times: [0, 0.7, 1] }}
              className="absolute w-32 h-32 bg-gradient-to-tr from-primary/60 to-secondary/60 rounded-full blur-xl"
            />
            {/* Second bloom layer */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.1, times: [0, 0.7, 1] }}
              className="absolute w-40 h-40 bg-gradient-to-tr from-pink-300/40 to-purple-300/40 rounded-full blur-2xl"
            />
            {/* Core flower-like element */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 90 }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-tl-full rounded-br-full shadow-lg shadow-primary/30 relative z-10"
            />
          </div>
          {/* Text Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center relative z-20"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight mb-2">
              Ololeo Store <span className="inline-block">🌸</span>
              Ololeo Bucket <span className="inline-block">🌸</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-gray-500 font-medium tracking-widest uppercase text-xs"
            >
              Crafted with love
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}