"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, LogOut, User } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import CartDrawer from "@/components/CartDrawer";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCart((state) => state.totalItems());
  const { isOpen: isCartOpen, setIsOpen: setIsCartOpen } = useCart();
  const { customer, logout, hydrate, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
    hydrate();
  }, [hydrate]);


  if (pathname?.startsWith("/sapanyak")) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-gray-100 dark:border-border shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-[68px]">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 tracking-tight"
            >
              Ololeo Store
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    pathname === link.href
                      ? "text-primary bg-pink-50 dark:bg-primary/10"
                      : "text-gray-600 dark:text-muted-foreground hover:text-primary hover:bg-pink-50/50 dark:hover:bg-primary/10"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right side: Cart + Auth + Theme */}
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />

              {/* Cart */}
              <button
                className="relative p-2 text-gray-600 dark:text-muted-foreground hover:text-primary hover:bg-pink-50 dark:hover:bg-primary/10 rounded-lg transition-all"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-[18px] h-[18px] text-[10px] font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Auth buttons (desktop) */}
              <div className="hidden md:flex items-center gap-2">
                {!isLoading && customer ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 rounded-lg">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                        {customer.name}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : !isLoading ? (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg hover:shadow-md hover:shadow-pink-200 transition-all"
                    >
                      Register
                    </Link>
                  </>
                ) : null}
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-primary hover:bg-pink-50 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav Menu */}
          <div
            className={cn(
              "md:hidden transition-all duration-300 overflow-hidden",
              isMobileMenuOpen
                ? "pb-4 opacity-100 max-h-96"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="border-t border-gray-100 pt-3">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-lg transition-all duration-200 font-semibold",
                      pathname === link.href
                        ? "bg-pink-50 text-primary"
                        : "text-gray-600 hover:text-primary hover:bg-pink-50/50"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile auth */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                {!isLoading && customer ? (
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-gray-700">
                        {customer.name}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="text-sm text-red-500 font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                ) : !isLoading ? (
                  <div className="flex gap-2 px-4">
                    <Link
                      href="/login"
                      className="flex-1 py-2.5 text-center text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="flex-1 py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg"
                    >
                      Register
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}