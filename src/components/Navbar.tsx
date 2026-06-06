"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import CartDrawer from "@/components/CartDrawer";
export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = useCart((state) => state.totalItems());
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (pathname?.startsWith("/sapanyak")) {
    return null;
  }
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
  ];
  return (
    <>
      <header
        className={cn(
          "fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 transition-all duration-300 rounded-[2rem]",
          isScrolled
            ? "bg-white/60 backdrop-blur-lg shadow-lg border border-white/40 overflow-hidden"
            : "bg-white/40 backdrop-blur-md shadow-sm border border-white/20 overflow-hidden"
        )}
      >
        <div className="px-6 md:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Ololeo Store
          </Link>
          
          <nav className="hidden md:flex gap-2 text-gray-800 font-semibold px-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-5 py-2 rounded-full transition-all duration-300",
                  pathname === link.href
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "hover:text-primary hover:bg-white/50"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="p-2.5 text-gray-800 hover:text-primary hover:bg-white/50 rounded-full transition-all relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
            <button 
              className="md:hidden p-2.5 text-gray-800 bg-white/40 hover:bg-white/60 transition-all rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile Nav Menu */}
        <div 
          className={cn(
            "md:hidden transition-all duration-300 px-6",
            isMobileMenuOpen ? "pb-4 opacity-100 max-h-56" : "max-h-0 opacity-0 overflow-hidden"
          )}
        >
          <hr className="border-white/30 mb-3" />
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-5 py-3 rounded-xl transition-all duration-300 font-semibold text-center",
                  pathname === link.href
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-gray-800 hover:text-primary hover:bg-white/50 bg-white/30"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}