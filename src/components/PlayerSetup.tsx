import React, { useState } from 'react';
import { Users, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlayerSetupProps {
  onStartGame: (playerNames: string[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [errors, setErrors] = useState<string[]>([]);

  const addPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, '']);
      setErrors([...errors, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 1) {
      const newNames = playerNames.filter((_, i) => i !== index);
      const newErrors = errors.filter((_, i) => i !== index);
      setPlayerNames(newNames);
      setErrors(newErrors);
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);

    // Clear error for this field
    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);
  };

  const handleStartGame = () => {
    const newErrors: string[] = playerNames.map(name => {
      if (!name.trim()) return 'Name is required';
      if (name.trim().length < 2) return 'Name must be at least 2 characters';
      return '';
    });

    // Check for duplicate names
    const nameCounts: { [key: string]: number } = {};
    playerNames.forEach((name, index) => {
      const trimmedName = name.trim().toLowerCase();
      if (trimmedName) {
        nameCounts[trimmedName] = (nameCounts[trimmedName] || 0) + 1;
        if (nameCounts[trimmedName] > 1) {
          newErrors[index] = 'Name must be unique';
        }
      }
    });

    setErrors(newErrors);

    if (newErrors.every(error => !error)) {
      onStartGame(playerNames.map(name => name.trim()));
    }
  };

  const isValidToStart = playerNames.every(name => name.trim().length >= 2) &&
    new Set(playerNames.map(name => name.trim().toLowerCase())).size === playerNames.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-green-900 rounded-xl p-8 border-2 border-yellow-400 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-4xl font-bold text-yellow-400 mb-2 hover:text-yellow-300 transition-colors duration-200 cursor-pointer"
          >
            Retro Blackjack
          </Link>
          <p className="text-white">Enter player names to start the game</p>
        </div>

        <div className="space-y-4 mb-6">
          {playerNames.map((name, index) => (
            <div key={index} className="relative">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-green-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200 ${
                      errors[index] ? 'border-red-500' : 'border-green-600'
                    }`}
                    maxLength={20}
                  />
                  {errors[index] && (
                    <p className="text-red-400 text-sm mt-1">{errors[index]}</p>
                  )}
                </div>
                {playerNames.length > 1 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-4">
          {playerNames.length < 4 && (
            <button
              onClick={addPlayer}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <Users className="w-4 h-4" />
              <span>Add Player</span>
            </button>
          )}

          <button
            onClick={handleStartGame}
            disabled={!isValidToStart}
            className={`flex items-center justify-center space-x-2 px-6 py-4 font-bold rounded-lg shadow-lg transform transition-all duration-200 ${
              isValidToStart
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 hover:scale-105'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Play className="w-5 h-5" />
            <span>Start Game</span>
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>1-4 players • No sign up required</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;