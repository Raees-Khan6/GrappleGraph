'use client';

import Link from 'next/link';
import Navbar from './components/navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-red-500">Grapple</span>
              <span className="text-white">Graph</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              BJJ ELO Ranking System
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Historical ELO ratings for Brazilian Jiu-Jitsu athletes based on ADCC and IBJJF competition results
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/rankings"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
              >
                View No-Gi Rankings
              </Link>
              <Link 
                href="/rankings/gi"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
              >
                View Gi Rankings
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-4xl font-bold text-red-500 mb-2">614</div>
                <div className="text-gray-300">Ranked Athletes</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-4xl font-bold text-red-500 mb-2">1,028</div>
                <div className="text-gray-300">Matches Analyzed</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-4xl font-bold text-red-500 mb-2">1998-2022</div>
                <div className="text-gray-300">ADCC History</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">📊 ELO Rating System</h3>
              <p className="text-gray-300">
                Scientifically calculated rankings based on match results, opponent strength, and competition tier. Variable K-factors ensure accurate representation of performance.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">🥋 Separate Gi & No-Gi</h3>
              <p className="text-gray-300">
                Independent rating pools for Gi and No-Gi competition, recognizing the distinct skill sets required for each ruleset.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">🏆 Historical Data</h3>
              <p className="text-gray-300">
                Comprehensive analysis of ADCC (1998-2022) competition results, providing a complete historical perspective on athlete performance.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">📈 Performance Tracking</h3>
              <p className="text-gray-300">
                Track athlete progression over time, peak ratings, match history, and head-to-head records against specific opponents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}