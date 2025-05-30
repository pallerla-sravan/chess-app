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
  const [boardWidth, setBoardWidth] = useState(560);
  const navigate = useNavigate();

  // Dynamically update board size
  const updateBoardSize = () => {
    const width = window.innerWidth;
    if (width < 500) setBoardWidth(300);
    else if (width < 768) setBoardWidth(400);
    else if (width < 1024) setBoardWidth(520);
    else setBoardWidth(680);
  };

  useEffect(() => {
    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  useEffect(() => {
    if (game) {
      const newGame = new Chess(game.fen());
      setCurrentGame(newGame);
      checkGameStatus(newGame);
    }
  }, [game]);

  useEffect(() => {
    if (gameStatus.includes("Wins")) {
      const timer = setTimeout(() => {
        onReset();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, onReset]);

  const checkGameStatus = (game) => {
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "Black" : "White";
      setGameStatus(`${winner} Wins by Checkmate!`);
    } else if (game.isDraw()) {
      setGameStatus("Draw!");
    } else if (game.isCheck()) {
      setGameStatus("Check!");
    } else {
      setGameStatus(game.turn() === "w" ? "White to Move" : "Black to Move");
    }
  };

  const handleMove = (sourceSquare, targetSquare) => {
    if (currentGame.isGameOver()) return false;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-7 h-7 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Two Player Chess
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm sm:text-base"
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
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex justify-center"
        >
          <Chessboard
            position={currentGame.fen()}
            onPieceDrop={handleMove}
            boardWidth={boardWidth}
            customBoardStyle={{
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
            }}
            customDarkSquareStyle={{ backgroundColor: "#1f2937" }}
            customLightSquareStyle={{ backgroundColor: "#374151" }}
          />
        </motion.div>

        {/* Game status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm text-center"
        >
          <div 
            className={`text-lg sm:text-xl font-semibold ${
              gameStatus.includes("Wins") 
                ? "text-green-400 animate-pulse" 
                : gameStatus.includes("Check") 
                  ? "text-red-400" 
                  : "text-blue-400"
            }`}
          >
            {gameStatus}
          </div>
          {!currentGame.isGameOver() && (
            <div className="text-gray-400 mt-2 text-sm sm:text-base">
              {currentGame.turn() === "w" ? "White's turn" : "Black's turn"}
            </div>
          )}
          {gameStatus.includes("Wins") && (
            <div className="text-gray-400 mt-2 text-sm sm:text-base">
              Starting new game in 15 seconds...
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default TwoPlayerGame;
