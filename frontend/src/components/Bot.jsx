import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import { CpuChipIcon } from '@heroicons/react/24/outline';

export default function BotGame() {
  const [game, setGame] = useState(new Chess());
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('Human vs Computer');

  // Bot move logic
  const makeBotMove = () => {
    setIsBotThinking(true);
    
    // Simple AI: Random valid move with 1 second delay
    setTimeout(() => {
      const moves = game.moves();
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const newGame = new Chess(game.fen());
        newGame.move(randomMove);
        setGame(newGame);
        checkGameStatus(newGame);
      }
      setIsBotThinking(false);
    }, 1000);
  };

  // Handle human moves
  const onDrop = (sourceSquare, targetSquare) => {
    if (isBotThinking || game.turn() === 'b') return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
      
      const newGame = new Chess(game.fen());
      setGame(newGame);
      checkGameStatus(newGame);
      
      // Trigger bot move after human move
      if (!newGame.isGameOver()) {
        makeBotMove();
      }
      return true;
    } catch {
      return false;
    }
  };

  // Check game status
  const checkGameStatus = (game) => {
    if (game.isCheckmate()) {
      setGameStatus(game.turn() === 'w' ? 'Black Wins!' : 'White Wins!');
    } else if (game.isDraw()) {
      setGameStatus('Draw!');
    } else if (game.isCheck()) {
      setGameStatus('Check!');
    } else {
      setGameStatus(game.turn() === 'w' ? 'White to Move' : 'Black to Move');
    }
  };

  // Reset game
  const resetGame = () => {
    setGame(new Chess());
    setGameStatus('Human vs Computer');
    setIsBotThinking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <CpuChipIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">vs Computer</h1>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"
          >
            New Game
          </motion.button>
        </motion.div>
        

        {/* Chess Board */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardWidth={560}
            customBoardStyle={{
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
            customDarkSquareStyle={{ backgroundColor: '#1f2937' }}
            customLightSquareStyle={{ backgroundColor: '#374151' }}
          />

          {/* Bot Thinking Overlay */}
          {isBotThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center"
            >
              <div className="text-white text-xl font-semibold">
                Computer is thinking...
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Game Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm text-center"
        >
          <div className="text-xl font-semibold text-purple-400">
            {gameStatus}
          </div>
          <div className="text-gray-400 mt-2">
            {game.turn() === 'w' ? 'Your turn' : 'Computer turn'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}