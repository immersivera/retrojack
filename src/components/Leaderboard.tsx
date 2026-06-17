import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  onClose?: () => void;
  variant?: 'modal' | 'page';
  closeLabel?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  leaderboard,
  onClose,
  variant = 'modal',
  closeLabel = 'Close',
}) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-white font-bold">{index + 1}</span>;
    }
  };

  const formatWinRate = (winRate: number) => {
    return `${(winRate * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const content = (
    <div className="bg-green-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-yellow-400">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <Trophy className="w-8 h-8" />
          Leaderboard
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-400 text-2xl font-bold transition-colors duration-200"
          >
            ×
          </button>
        )}
      </div>

      {leaderboard.length === 0 ? (
          <div className="text-center text-white py-8">
            <p className="text-xl">No games played yet!</p>
            <p className="text-gray-400 mt-2">Start playing to see your stats here.</p>
          </div>
      ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.name}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                  index === 0 
                    ? 'bg-yellow-400 bg-opacity-20 border-yellow-400' 
                    : 'bg-green-800 border-green-600 hover:border-green-500'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {getRankIcon(index)}
                  <div>
                    <h3 className="font-bold text-white text-lg">{entry.name}</h3>
                    <p className="text-gray-300 text-sm">Last played: {formatDate(entry.lastPlayed)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-bold text-lg">
                    {formatWinRate(entry.winRate)}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {entry.wins}W - {entry.losses}L - {entry.ties}T
                  </div>
                  <div className="text-gray-400 text-xs">
                    {entry.wins + entry.losses + entry.ties} games
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {onClose && (
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-400 hover:to-green-500 transform hover:scale-105 transition-all duration-200"
          >
            {closeLabel}
          </button>
        </div>
      )}
    </div>
  );

  if (variant === 'page') {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {content}
    </div>
  );
};

export default Leaderboard;