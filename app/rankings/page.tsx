'use client';

import {useEffect, useState} from 'react';
import Navbar from '../components/navbar';

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  noGiEloRating: number;
  noGiPeakElo: number;
  noGiMatches: number;
  totalWins: number;
  totalLosses: number;
}

export default function RankingsPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Rankings();
  }, []);

  const Rankings = async () => {
    try {
      const response = await fetch('/api/athletes?ruleset=nogi');
      if (!response.ok) throw new Error('Could not get athletes rankings');
      const data = await response.json();
      setAthletes(data.athletes || []);
    } catch (err) {
      setError('Could not load athletes ranks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const winRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return '0.0';
    return ((wins / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Finding your favourite grapplers ranks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            No-Gi Rankings
          </h1>
          <p className="text-gray-600">
            ADCC Rankings (1998-2022) | {athletes.length} Athletes
          </p>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  ELO Rating
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  Peak ELO
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  Record
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  Win %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {athletes.map((athlete, index) => (
                <tr 
                  key={athlete.id}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${index === 0 ? 'bg-yellow-50' : ''}
                    ${index === 1 ? 'bg-gray-100' : ''}
                    ${index === 2 ? 'bg-orange-50' : ''}
                  `}
                >
                  {/* Rank */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`
                        text-lg font-bold
                        ${index === 0 ? 'text-yellow-600' : ''}
                        ${index === 1 ? 'text-gray-600' : ''}
                        ${index === 2 ? 'text-orange-600' : ''}
                        ${index > 2 ? 'text-gray-900' : ''}
                      `}>
                        #{index + 1}
                      </span>
                      {index === 0 && <span className="ml-2 text-xl">🥇</span>}
                      {index === 1 && <span className="ml-2 text-xl">🥈</span>}
                      {index === 2 && <span className="ml-2 text-xl">🥉</span>}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {athlete.firstName} {athlete.lastName}
                    </div>
                  </td>

                  {/* ELO Rating */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {athlete.noGiEloRating}
                    </div>
                  </td>

                  {/* Peak ELO */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600">
                      {athlete.noGiPeakElo}
                    </div>
                  </td>

                  {/* Matches */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {athlete.noGiMatches}
                    </div>
                  </td>

                  {/* Record */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {athlete.totalWins}-{athlete.totalLosses}
                    </div>
                  </td>

                  {/* Win% */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className={`
                      text-sm font-semibold
                      ${parseFloat(winRate(athlete.totalWins, athlete.totalLosses)) >= 80 
                        ? 'text-green-600' 
                        : parseFloat(winRate(athlete.totalWins, athlete.totalLosses)) >= 60
                        ? 'text-blue-600'
                        : 'text-gray-600'
                      }
                    `}>
                      {winRate(athlete.totalWins, athlete.totalLosses)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Highest Rating</div>
            <div className="text-2xl font-bold text-gray-900">
              {athletes[0]?.noGiEloRating || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {athletes[0]?.firstName} {athletes[0]?.lastName}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Athletes</div>
            <div className="text-2xl font-bold text-gray-900">
              {athletes.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Ranked competitors
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Average Rating</div>
            <div className="text-2xl font-bold text-gray-900">
              {athletes.length > 0 
                ? Math.round(athletes.reduce((sum, a) => sum + a.noGiEloRating, 0) / athletes.length)
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Across all athletes
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}