import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { motion } from "framer-motion";
import { UserGroupIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function TwoPlayerGame() {
  const [game, setGame] = useState(new Chess());

  const handleMove = (move) => {
    const newGame = new Chess(game.fen());
    newGame.move(move);
    setGame(newGame);
  };

  const resetGame = () => {
    setGame(new Chess());
  };

  return (
    <ChessBoard 
      game={game}
      onMove={handleMove}
      onReset={resetGame}
    />
  );
}

function ChessBoard({ game, onMove, onReset }) {
  const [currentGame, setCurrentGame] = useState(new Chess());
  const [gameStatus, setGameStatus] = useState("White to Move");
  const navigate = useNavigate();

  useEffect(() => {
    if (game) {
      const newGame = new Chess(game.fen());
      setCurrentGame(newGame);
      checkGameStatus(newGame);
    }
  }, [game]);

  const checkGameStatus = (game) => {
    if (game.isCheckmate()) {
      setGameStatus(game.turn() === "w" ? "Black Wins!" : "White Wins!");
    } else if (game.isDraw()) {
      setGameStatus("Draw!");
    } else if (game.isCheck()) {
      setGameStatus("Check!");
    } else {
      setGameStatus(game.turn() === "w" ? "White to Move" : "Black to Move");
    }
  };

  const handleMove = (sourceSquare, targetSquare) => {
    if (!onMove) return false;

    try {
      const move = currentGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move) {
        onMove(move);
        return true;
      }
    } catch (e) {
      console.error("Invalid move:", e);
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <UserGroupIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Two Player Chess</h1>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
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

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <Chessboard
            position={currentGame.fen()}
            onPieceDrop={handleMove}
            boardWidth={560}
            customBoardStyle={{
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
            customDarkSquareStyle={{ backgroundColor: "#1f2937" }}
            customLightSquareStyle={{ backgroundColor: "#374151" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm text-center"
        >
          <div className="text-xl font-semibold text-blue-400">
            {gameStatus}
          </div>
          <div className="text-gray-400 mt-2">
            {currentGame.turn() === "w" ? "White's turn" : "Black's turn"}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TwoPlayerGame;
