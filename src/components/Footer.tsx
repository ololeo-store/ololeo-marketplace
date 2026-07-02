"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/sapanyak')) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-br from-indigo-50 to-primary/10 pt-16 pb-8 border-t border-primary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4 inline-block">
              Ololeo Store
            </Link>
            <p className="text-gray-600 max-w-sm mt-2">
              Send Happiness in Every Bloom. We provide the most beautiful handcrafted flower buckets for your special moments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/shop" className="text-gray-600 hover:text-primary transition-colors">Shop</Link></li>
              <li><Link href="#about" className="text-gray-600 hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Cimahi, Indonesia</li>
              <li>@ololeo.bucket</li>
              <li>+62 888 0948 2113</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
          &copy; {new Date().getFullYear()} Ololeo Store. All rights reserved.
          &copy; {new Date().getFullYear()} Ololeo Bucket. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
