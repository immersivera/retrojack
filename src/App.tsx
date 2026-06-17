import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GameState, GameResult } from './types/game';
import { 
  initializeGame, 
  dealCard, 
  calculateScore, 
  isBlackjack, 
  shouldDealerHit, 
  determineWinner 
} from './utils/gameLogic';
import { getLeaderboard, updateLeaderboard } from './utils/localStorage';
import PlayerSetup from './components/PlayerSetup';
import DealerHand from './components/DealerHand';
import PlayerHand from './components/PlayerHand';
import GameControls from './components/GameControls';
import Leaderboard from './components/Leaderboard';
import CookieBanner from './components/CookieBanner';
import LegalPage from './components/LegalPage';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAboutSubmenu, setShowAboutSubmenu] = useState(false);
  const [leaderboard, setLeaderboard] = useState(getLeaderboard());
  const dealTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const dealInitialCards = useCallback((state: GameState) => {
    let newState = { ...state };
    
    // Deal 2 cards to each player
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < newState.players.length; i++) {
        const { card, remainingDeck } = dealCard(newState.deck);
        newState.deck = remainingDeck;
        newState.players[i].hand.push(card);
        newState.players[i].score = calculateScore(newState.players[i].hand);
        newState.players[i].hasBlackjack = isBlackjack(newState.players[i].hand);
      }
      
      // Deal card to dealer
      const { card, remainingDeck } = dealCard(newState.deck);
      newState.deck = remainingDeck;
      newState.dealer.hand.push(card);
      newState.dealer.score = calculateScore(newState.dealer.hand);
      newState.dealer.hasBlackjack = isBlackjack(newState.dealer.hand);
    }
    
    return newState;
  }, []);

  const startGame = (playerNames: string[]) => {
    const initialState = initializeGame(playerNames);
    
    if (dealTimeoutRef.current) {
      window.clearTimeout(dealTimeoutRef.current);
    }

    dealTimeoutRef.current = window.setTimeout(() => {
      const stateWithCards = dealInitialCards(initialState);
      setGameState({
        ...stateWithCards,
        gamePhase: 'playing'
      });
      dealTimeoutRef.current = null;
    }, 500);
    
    setGameState(initialState);
    navigate('/game');
  };

  const hit = () => {
    if (!gameState || gameState.gamePhase !== 'playing') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isStanding || currentPlayer.isBusted) return;
    
    const { card, remainingDeck } = dealCard(gameState.deck);
    const newHand = [...currentPlayer.hand, card];
    const newScore = calculateScore(newHand);
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      hand: newHand,
      score: newScore,
      isBusted: newScore > 21
    };
    
    let newGameState = {
      ...gameState,
      players: updatedPlayers,
      deck: remainingDeck
    };
    
    // If busted, automatically move to next player
    if (newScore > 21) {
      newGameState = moveToNextPlayer(newGameState);
    }
    
    setGameState(newGameState);
  };

  const stand = () => {
    if (!gameState || gameState.gamePhase !== 'playing') return;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex].isStanding = true;
    
    const newGameState = {
      ...gameState,
      players: updatedPlayers
    };
    
    setGameState(moveToNextPlayer(newGameState));
  };

  const moveToNextPlayer = (state: GameState): GameState => {
    const nextPlayerIndex = state.currentPlayerIndex + 1;
    
    if (nextPlayerIndex >= state.players.length) {
      // All players have played, start dealer turn
      return {
        ...state,
        gamePhase: 'dealer-turn',
        dealer: { ...state.dealer, isRevealed: true }
      };
    } else {
      // Move to next player
      const updatedPlayers = [...state.players];
      updatedPlayers.forEach((player, index) => {
        player.isActive = index === nextPlayerIndex;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex
      };
    }
  };

  const playDealerTurn = useCallback(() => {
    if (!gameState || gameState.gamePhase !== 'dealer-turn') return;
    
    let newDealer = { ...gameState.dealer };
    let newDeck = [...gameState.deck];
    
    const dealerPlay = () => {
      if (shouldDealerHit(newDealer.score)) {
        setTimeout(() => {
          const { card, remainingDeck } = dealCard(newDeck);
          newDealer.hand.push(card);
          newDealer.score = calculateScore(newDealer.hand);
          newDealer.isBusted = newDealer.score > 21;
          newDeck = remainingDeck;
          
          setGameState({
            ...gameState,
            dealer: newDealer,
            deck: newDeck
          });
          
          if (shouldDealerHit(newDealer.score) && !newDealer.isBusted) {
            dealerPlay();
          } else {
            // Dealer is done, end game
            setTimeout(() => {
              endGame({
                ...gameState,
                dealer: newDealer,
                deck: newDeck,
                gamePhase: 'game-over'
              });
            }, 1000);
          }
        }, 1500);
      } else {
        // Dealer stands, end game
        setTimeout(() => {
          endGame({
            ...gameState,
            dealer: newDealer,
            gamePhase: 'game-over'
          });
        }, 1000);
      }
    };
    
    dealerPlay();
  }, [gameState]);

  const endGame = (finalState: GameState) => {
    const results: GameResult[] = finalState.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      result: determineWinner(
        player.score, 
        finalState.dealer.score, 
        player.hasBlackjack, 
        finalState.dealer.hasBlackjack
      ),
      playerScore: player.score,
      dealerScore: finalState.dealer.score
    }));
    
    updateLeaderboard(results);
    setLeaderboard(getLeaderboard());
    setGameState(finalState);
  };

  const newGame = () => {
    if (!gameState) return;
    const playerNames = gameState.players.map(player => player.name);
    startGame(playerNames);
  };

  const stopGame = () => {
    if (dealTimeoutRef.current) {
      window.clearTimeout(dealTimeoutRef.current);
      dealTimeoutRef.current = null;
    }
    setGameState(null);
    setShowMenu(false);
    navigate('/');
  };

  const openCookieSettings = () => {
    setShowMenu(false);
    window.dispatchEvent(new Event('open-cookie-settings'));
  };

  const openMainPage = () => {
    setShowMenu(false);
    navigate('/');
  };

  const openGamePage = () => {
    setShowMenu(false);
    navigate('/game');
  };

  const openLeaderboard = () => {
    setShowMenu(false);
    setLeaderboard(getLeaderboard());
    navigate('/leaderboard');
  };

  const openLegalPage = (path: string) => {
    setShowMenu(false);
    setShowAboutSubmenu(false);
    navigate(path);
  };

  useEffect(() => {
    if (gameState?.gamePhase === 'dealer-turn') {
      playDealerTurn();
    }
  }, [gameState?.gamePhase, playDealerTurn]);

  useEffect(() => {
    return () => {
      if (dealTimeoutRef.current) {
        window.clearTimeout(dealTimeoutRef.current);
      }
    };
  }, []);

  const menu = (
    <div className="fixed top-4 left-4 z-40">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        aria-label="Open menu"
        className="bg-green-900 border-2 border-yellow-400 text-yellow-400 rounded-lg p-3 shadow-lg hover:bg-green-800 transition-all duration-200"
      >
        {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {showMenu && (
        <div className="mt-2 w-52 bg-green-900 border-2 border-yellow-400 rounded-xl shadow-2xl overflow-hidden">
          <button
            onClick={openMainPage}
            className="w-full px-4 py-3 text-left text-white font-bold hover:bg-green-800 transition-colors duration-200"
          >
            Home
          </button>
          {gameState && (
            <button
              onClick={openGamePage}
              className="w-full px-4 py-3 text-left text-white font-bold hover:bg-green-800 transition-colors duration-200"
            >
              Game
            </button>
          )}
          <button
            onClick={openLeaderboard}
            className="w-full px-4 py-3 text-left text-white font-bold hover:bg-green-800 transition-colors duration-200"
          >
            Leaderboard
          </button>
          <button
            onClick={openCookieSettings}
            className="w-full px-4 py-3 text-left text-white font-bold hover:bg-green-800 transition-colors duration-200"
          >
            Cookie settings
          </button>
          <button
            onClick={() => setShowAboutSubmenu((prev) => !prev)}
            className="w-full px-4 py-3 text-left text-white font-bold hover:bg-green-800 transition-colors duration-200 flex items-center justify-between"
          >
            <span>About</span>
            <span className={`transform transition-transform duration-200 ${showAboutSubmenu ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {showAboutSubmenu && (
            <div className="bg-green-800 border-t border-green-600">
              <button
                onClick={() => openLegalPage('/cookie-policy')}
                className="w-full px-6 py-2 text-left text-gray-200 font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Cookie policy
              </button>
              <button
                onClick={() => openLegalPage('/privacy')}
                className="w-full px-6 py-2 text-left text-gray-200 font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Privacy policy
              </button>
              <button
                onClick={() => openLegalPage('/terms')}
                className="w-full px-6 py-2 text-left text-gray-200 font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Terms of service
              </button>
            </div>
          )}
          {gameState && (
            <button
              onClick={stopGame}
              className="w-full px-4 py-3 text-left text-red-300 font-bold hover:bg-green-800 transition-colors duration-200"
            >
              Stop game
            </button>
          )}
        </div>
      )}
    </div>
  );

  const setupPage = <PlayerSetup onStartGame={startGame} />;

  const gamePage = !gameState ? (
    <Navigate to="/" replace />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-6xl font-bold text-yellow-400 mb-2">
            Retro Blackjack
          </h1>
          <p className="text-white text-lg">Round {gameState.round}</p>
        </div>

        {/* Dealer Section */}
        <div className="mb-8">
          <DealerHand dealer={gameState.dealer} gamePhase={gameState.gamePhase} />
        </div>

        {/* Players Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {gameState.players.map((player, index) => (
            <PlayerHand
              key={player.id}
              player={player}
              isCurrentPlayer={index === gameState.currentPlayerIndex && gameState.gamePhase === 'playing'}
            />
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex justify-center">
          <GameControls
            gameState={gameState}
            onHit={hit}
            onStand={stand}
            onNewGame={newGame}
            onShowLeaderboard={openLeaderboard}
          />
        </div>

        {/* Game Results */}
        {gameState.gamePhase === 'game-over' && (
          <div className="mt-8 bg-green-900 rounded-xl p-6 border-2 border-yellow-400">
            <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4">Final Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameState.players.map(player => {
                const result = determineWinner(
                  player.score,
                  gameState.dealer.score,
                  player.hasBlackjack,
                  gameState.dealer.hasBlackjack
                );
                const resultText = result === 'win' ? 'WON' : result === 'loss' ? 'LOST' : 'TIE';
                const resultColor = result === 'win' ? 'text-green-400' : result === 'loss' ? 'text-red-400' : 'text-yellow-400';
                
                return (
                  <div key={player.id} className="bg-green-800 rounded-lg p-4 text-center border border-green-600">
                    <h4 className="font-bold text-white text-lg">{player.name}</h4>
                    <p className="text-gray-300">Score: {player.score}</p>
                    <p className={`font-bold text-xl ${resultColor}`}>{resultText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );

  const leaderboardPage = (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4 pt-20">
      <div className="max-w-7xl mx-auto flex justify-center">
        <Leaderboard
          leaderboard={leaderboard}
          variant="page"
          onClose={() => navigate(gameState ? '/game' : '/')}
          closeLabel={gameState ? 'Back to game' : 'Back to main'}
        />
      </div>
    </div>
  );

  const manageCookiesFromLegalPage = () => {
    window.dispatchEvent(new Event('open-cookie-settings'));
  };

  return (
    <>
      {menu}
      <Routes>
        <Route path="/" element={setupPage} />
        <Route path="/game" element={gamePage} />
        <Route path="/leaderboard" element={leaderboardPage} />
        <Route path="/cookie-policy" element={<LegalPage type="cookie" onManageCookies={manageCookiesFromLegalPage} />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieBanner />
    </>
  );
}

export default App;