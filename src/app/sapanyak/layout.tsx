"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderTree,
  ShoppingBag,
  Receipt,
  MessageSquare,
  Users,
  Settings,
  Image as ImageIcon,
  Star,
  Sparkles,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Award,
  DollarSign,
  Package,
  Search,
  Percent,
  TrendingUp
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("Admin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check authentication
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("ololeo_admin_token");
    const adminUser = localStorage.getItem("ololeo_admin_user");

    // Skip auth check for login page itself
    if (pathname === "/sapanyak/login") {
      return;
    }

    if (!token) {
      router.push("/sapanyak/login");
    } else if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setAdminName(user.name || "Administrator");
      } catch (e) {
        setAdminName("Administrator");
      }
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Failed to clear cookie on backend:", e);
    }
    localStorage.removeItem("ololeo_admin_token");
    localStorage.removeItem("ololeo_admin_user");
    router.push("/sapanyak/login");
  };

  // Skip showing layout on login page
  if (pathname === "/sapanyak/login") {
    return <>{children}</>;
  }

  const menuCategories = [
    {
      title: "Overview & Catalog",
      items: [
        { name: "Overview", href: "/sapanyak/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/sapanyak/analytics", icon: TrendingUp },
        { name: "Products", href: "/sapanyak/products", icon: Award },
        { name: "Categories", href: "/sapanyak/categories", icon: FolderTree },
        { name: "Gallery Items", href: "/sapanyak/gallery-items", icon: ImageIcon },
      ]
    },
    {
      title: "Sales & Customer",
      items: [
        { name: "Orders", href: "/sapanyak/orders", icon: ShoppingBag },
        { name: "Payments", href: "/sapanyak/payments", icon: Receipt },
        { name: "Discounts", href: "/sapanyak/discounts", icon: Percent },
        { name: "Reviews", href: "/sapanyak/reviews", icon: Star },
      ]
    },
    {
      title: "Finance & Inventory",
      items: [
        { name: "Financial Records", href: "/sapanyak/transactions", icon: DollarSign },
        { name: "Raw Materials", href: "/sapanyak/raw-materials", icon: Package },
      ]
    },
    {
      title: "Settings & Config",
      items: [
        { name: "AI Chat History", href: "/sapanyak/ai-chat", icon: MessageSquare },
        { name: "Store Settings", href: "/sapanyak/settings", icon: Settings },
        { name: "Store Values", href: "/sapanyak/store-values", icon: Sparkles },
        { name: "Admins", href: "/sapanyak/admins", icon: Users },
      ]
    }
  ];

  const filteredCategories = menuCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  const getPageTitle = () => {
    for (const cat of menuCategories) {
      const found = cat.items.find((item) => item.href === pathname);
      if (found) return found.name;
    }
    return "Dashboard";
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200/80 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-8 flex items-center justify-between border-b border-gray-100 shrink-0">
          <Link href="/sapanyak/dashboard" className="flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-primary to-secondary text-white rounded-xl shadow-md shadow-primary/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Ololeo Admin
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100/60 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl outline-none text-xs transition-all font-semibold text-gray-600 shadow-sm"
            />
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6 scrollbar-thin">
          {filteredCategories.map((category) => (
            <div key={category.title} className="space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4">
                {category.title}
              </h4>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/20"
                          : "text-gray-500 hover:text-primary hover:bg-pink-50/30"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="text-center text-xs text-gray-400 pt-4 font-semibold">Menu tidak ditemukan</p>
          )}
        </nav>

        {/* Logout Footer Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header bar */}
        <header className="h-20 bg-white border-b border-gray-200/80 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="hidden md:block text-xl font-bold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* User status card */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{adminName}</p>
              <p className="text-xs font-semibold text-primary">Role: Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-extrabold flex items-center justify-center shadow-md shadow-primary/10">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content Page */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
