import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import { CpuChipIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
}

export default function BotGame() {
  const [game, setGame] = useState(new Chess());
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('Human vs Computer');
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
  const [width] = useWindowSize();

  // Dynamically determine board size
  const getBoardSize = () => {
    if (width < 500) return 300;
    if (width < 768) return 400;
    if (width < 1024) return 520;
    return 680; // For desktop and large screens
  };

  // Auto-reset after checkmate
  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        resetGame();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [gameOver]);

  const makeBotMove = () => {
    if (game.isGameOver()) return;
    setIsBotThinking(true);
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

  const onDrop = (sourceSquare, targetSquare) => {
    if (isBotThinking || game.turn() === 'b' || gameOver) return false;
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
      const newGame = new Chess(game.fen());
      setGame(newGame);
      checkGameStatus(newGame);
      if (!newGame.isGameOver()) {
        makeBotMove();
      }
      return true;
    } catch {
      return false;
    }
  };

  const checkGameStatus = (game) => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Computer (Black)' : 'You (White)';
      setGameStatus(`${winner} Wins by Checkmate!`);
      setGameOver(true);
    } else if (game.isDraw()) {
      setGameStatus('Draw!');
      setGameOver(true);
    } else if (game.isCheck()) {
      setGameStatus('Check!');
      setGameOver(false);
    } else {
      setGameStatus(game.turn() === 'w' ? 'Your turn' : 'Computer thinking...');
      setGameOver(false);
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setGameStatus('Human vs Computer');
    setIsBotThinking(false);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <CpuChipIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">vs Computer</h1>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"
            >
              New Game
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/gamemods")}
              className="p-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition"
              title="Go to Home"
            >
              <HomeIcon className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Chessboard */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative mx-auto"
          style={{ width: getBoardSize() }}
        >
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardWidth={getBoardSize()}
            customBoardStyle={{
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            }}
            customDarkSquareStyle={{ backgroundColor: '#1f2937' }}
            customLightSquareStyle={{ backgroundColor: '#374151' }}
          />

          {/* Overlays */}
          {isBotThinking && !gameOver && (
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

          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center"
            >
              <div className="text-center p-6 bg-gray-800/90 rounded-lg">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {gameStatus}
                </div>
                <div className="text-gray-300">
                  New game starting in 15 seconds...
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Game status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm text-center"
        >
          <div className={`text-xl font-semibold ${
            gameStatus.includes('Wins') ? 'text-green-400 animate-pulse' :
            gameStatus.includes('Check') ? 'text-red-400' :
            'text-purple-400'
          }`}>
            {gameStatus}
          </div>
          {!gameOver && (
            <div className="text-gray-400 mt-2">
              {game.turn() === 'w' ? 'Your turn (White)' : 'Computer turn (Black)'}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
