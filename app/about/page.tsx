'use client';

import Navbar from "../components/navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About GrappleGraph
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Project Overview</h2>
              <p className="text-gray-700 mb-6">
                GrappleGraph is a Brazilian Jiu-Jitsu ELO ranking system developed as a Final Year Project 
                at City St George's, University of London. The system analyzes historical competition data 
                to provide objective, algorithm-based rankings of BJJ athletes.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Methodology</h2>
              <p className="text-gray-700 mb-4">
                The ranking system uses the ELO rating algorithm, adapted for combat sports with the following features:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Variable K-factors based on competition tier (WORLDS=32, INTERNATIONAL=28, etc.)</li>
                <li>Separate rating pools for Gi and No-Gi competition</li>
                <li>Chronological processing of matches (oldest to newest)</li>
                <li>Historical ELO tracking for performance analysis</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Sources</h2>
              <p className="text-gray-700 mb-4">
                Current dataset includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>ADCC (No-Gi):</strong> 1,028 matches from 1998-2022</li>
                <li><strong>Athletes:</strong> 614 ranked competitors</li>
                <li><strong>IBJJF (Gi):</strong> Coming soon</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technology Stack</h2>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Next.js 14 (React framework)</li>
                <li>TypeScript</li>
                <li>PostgreSQL (Supabase)</li>
                <li>Prisma ORM</li>
                <li>Tailwind CSS</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Developer</h2>
              <p className="text-gray-700">
                Raees Khan<br />
                BSc Computer Science<br />
                City St George's, University of London<br />
                Student ID: 220006030
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}