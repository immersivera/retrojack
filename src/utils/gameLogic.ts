import { Card, Player, Dealer, GameState } from '../types/game';

let globalCardIdCounter = 0;

export const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      let value = 0;
      if (rank === 'A') value = 11;
      else if (['J', 'Q', 'K'].includes(rank)) value = 10;
      else value = parseInt(rank);

      deck.push({
        suit,
        rank,
        value,
        id: `${suit}-${rank}-${globalCardIdCounter++}`
      });
    });
  });

  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateScore = (hand: Card[]): number => {
  let score = 0;
  let aces = 0;

  hand.forEach(card => {
    if (card.rank === 'A') {
      aces++;
      score += 11;
    } else {
      score += card.value;
    }
  });

  // Adjust for aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
};

export const isBlackjack = (hand: Card[]): boolean => {
  return hand.length === 2 && calculateScore(hand) === 21;
};

export const dealCard = (deck: Card[]): { card: Card; remainingDeck: Card[] } => {
  const newDeck = [...deck];
  const card = newDeck.pop();
  if (!card) throw new Error('Deck is empty');
  return { card, remainingDeck: newDeck };
};

export const shouldDealerHit = (dealerScore: number): boolean => {
  return dealerScore < 17;
};

export const determineWinner = (playerScore: number, dealerScore: number, playerBlackjack: boolean, dealerBlackjack: boolean): 'win' | 'loss' | 'tie' => {
  // Both blackjack
  if (playerBlackjack && dealerBlackjack) return 'tie';
  
  // Player blackjack, dealer doesn't
  if (playerBlackjack && !dealerBlackjack) return 'win';
  
  // Dealer blackjack, player doesn't
  if (dealerBlackjack && !playerBlackjack) return 'loss';
  
  // Player busted
  if (playerScore > 21) return 'loss';
  
  // Dealer busted, player didn't
  if (dealerScore > 21 && playerScore <= 21) return 'win';
  
  // Both under 21
  if (playerScore > dealerScore) return 'win';
  if (playerScore < dealerScore) return 'loss';
  
  return 'tie';
};

export const initializeGame = (playerNames: string[]): GameState => {
  const deck = createDeck();
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    hand: [],
    score: 0,
    isStanding: false,
    isBusted: false,
    hasBlackjack: false,
    isActive: index === 0
  }));

  const dealer: Dealer = {
    hand: [],
    score: 0,
    isRevealed: false,
    isBusted: false,
    hasBlackjack: false
  };

  return {
    players,
    dealer,
    deck,
    currentPlayerIndex: 0,
    gamePhase: 'dealing',
    round: 1
  };
};