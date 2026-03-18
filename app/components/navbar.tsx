'use client';


import Link from 'next/link';
export default function Navbar() {
  return (
        <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-white">
              <span className="text-red-500">Grapple</span>
              <span className="text-white">Graph</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              href="/"
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </Link>

            <Link 
              href="/rankings"
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              No Gi Rankings
            </Link>

            <Link 
              href="/rankings/gi"
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Gi Rankings
            </Link>

            <Link 
              href="/about"
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              About
            </Link>

          </div>
          </div>
         </div>
        </nav>
  );
}