import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  XMarkIcon,
  NoSymbolIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useFirebase } from "../context/User";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const socket = io("https://chess-app-b7dl.onrender.com", {
  transports: ["websocket"],
});

export default function Online() {
  const [game, setGame] = useState(new Chess());
  const [roomId, setRoomId] = useState("");
  const [playerColor, setPlayerColor] = useState(null);
  const [joined, setJoined] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState("");
  const [validMoves, setValidMoves] = useState([]);
  const [status, setStatus] = useState("Disconnected");
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState("Waiting for opponent...");

  const { app } = useFirebase();
  const db = getFirestore(app);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(new MediaStream());
  const candidatesCollection = useRef(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const mediaConstraints = {
    video: true,
    audio: true,
  };

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to get media:", err);
      }
    };

    initMedia();

    return () => {
      localStream.current?.getTracks().forEach((track) => track.stop());
      peerConnection.current?.close();
    };
  }, []);

  // Check game status whenever game state changes
  useEffect(() => {
    if (!game) return;

    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "Black" : "White";
      const winMessage = playerColor 
        ? (winner === playerColor ? "You Win!" : "Opponent Wins!")
        : `${winner} Wins!`;
      setGameStatus(`${winMessage} by Checkmate!`);
      setGameOver(true);
    } else if (game.isDraw()) {
      setGameStatus("Game Drawn!");
      setGameOver(true);
    } else if (game.isCheck()) {
      setGameStatus(`${game.turn() === "w" ? "White" : "Black"} is in Check`);
      setGameOver(false);
    } else {
      setGameStatus(`${game.turn() === "w" ? "White" : "Black"} to move`);
      setGameOver(false);
    }
  }, [game, playerColor]);

  const toggleVideo = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsVideoEnabled(prev => !prev);
  };

  const toggleAudio = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsAudioEnabled(prev => !prev);
  };

  useEffect(() => {
    if (!joined) return;

    socket.on("opponentMove", (move) => {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      setGame(newGame);
    });

    socket.on("assignColor", (color) => {
      setPlayerColor(color);
      setGameStatus(color === "white" ? "Your turn (White)" : "Waiting for opponent...");
    });

    return () => {
      socket.off("opponentMove");
      socket.off("assignColor");
    };
  }, [joined, game]);

  const handleSquareClick = (square) => {
    if (gameOver || !joined || !playerColor || playerColor[0] !== game.turn()[0]) return;

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square, promotion: "q" };

      try {
        const gameCopy = new Chess(game.fen());
        const result = gameCopy.move(move);

        if (result) {
          setGame(gameCopy);
          socket.emit("move", { roomId, move: result });
          setSelectedSquare("");
          setValidMoves([]);
        }
      } catch {
        setSelectedSquare("");
        setValidMoves([]);
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === playerColor[0]) {
        const moves = game.moves({ square, verbose: true });
        setSelectedSquare(square);
        setValidMoves(moves.map((m) => m.to));
      }
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGameOver(false);
    setGameStatus(playerColor === "white" ? "Your turn (White)" : "Waiting for opponent...");
    socket.emit("resetGame", { roomId });
  };

  useEffect(() => {
    if (!joined) return;

    socket.on("gameReset", () => {
      const newGame = new Chess();
      setGame(newGame);
      setGameOver(false);
      setGameStatus(playerColor === "white" ? "Your turn (White)" : "Waiting for opponent...");
    });

    return () => {
      socket.off("gameReset");
    };
  }, [joined, playerColor]);

  const createPeerConnection = () => {
    const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
    peerConnection.current = new RTCPeerConnection(config);

    localStream.current.getTracks().forEach((track) =>
      peerConnection.current.addTrack(track, localStream.current)
    );

    peerConnection.current.ontrack = (event) => {
      remoteStream.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream.current;
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && candidatesCollection.current) {
        setDoc(doc(candidatesCollection.current), event.candidate.toJSON());
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      setStatus(peerConnection.current.connectionState);
    };
  };

  const setupWebRTC = async (roomId, isCreator) => {
    createPeerConnection();
    const callDoc = doc(db, "calls", roomId);

    if (isCreator) {
      candidatesCollection.current = collection(db, "calls", roomId, "offerCandidates");

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      await setDoc(callDoc, { offer });

      onSnapshot(callDoc, async (snapshot) => {
        const data = snapshot.data();
        if (data?.answer && !peerConnection.current.remoteDescription) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      });

      const answerCandidates = collection(db, "calls", roomId, "answerCandidates");
      onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
          }
        });
      });
    } else {
      candidatesCollection.current = collection(db, "calls", roomId, "answerCandidates");

      const callData = (await getDoc(callDoc)).data();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(callData.offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      await setDoc(callDoc, { answer }, { merge: true });

      const offerCandidates = collection(db, "calls", roomId, "offerCandidates");
      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
          }
        });
      });
    }
  };

  const handleCreateRoom = async () => {
    if (!roomId.trim()) return;
    socket.emit("joinRoom", roomId);
    setJoined(true);
    setStatus("Creating Room...");
    await setupWebRTC(roomId, true);
  };

  const joinRoom = async () => {
    if (!roomId.trim()) return;
    socket.emit("joinRoom", roomId);
    setJoined(true);
    setStatus("Joining Room...");
    await setupWebRTC(roomId, false);
  };

  const customSquareStyles = {
    ...(selectedSquare && {
      [selectedSquare]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
    }),
    ...validMoves.reduce((acc, curr) => {
      acc[curr] = {
        background: "radial-gradient(circle, rgba(255,100,100,0.3) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return acc;
    }, {}),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {!joined ? (
          <motion.div className="mb-6 flex flex-col items-center bg-white/5 p-6 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserGroupIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold">Online Chess Room</h1>
            </div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="mb-4 px-4 py-2 border border-gray-600 rounded text-white bg-gray-700"
            />
            <div className="flex gap-4">
              <button onClick={handleCreateRoom} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Create Room
              </button>
              <button onClick={joinRoom} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Join Room
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-4">
                <UserGroupIcon className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl font-semibold">Room ID: {roomId}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-sm ${
                  status === "connected" ? "text-green-400" : 
                  status === "disconnected" ? "text-red-400" : 
                  "text-yellow-400"
                }`}>
                  Connection: {status}
                </div>
                {gameOver && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-1"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Rematch
                  </motion.button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full flex justify-center relative">
                <Chessboard
                  position={game.fen()}
                  onSquareClick={handleSquareClick}
                  arePiecesDraggable={false}
                  customSquareStyles={customSquareStyles}
                  boardOrientation={playerColor}
                  boardWidth={560}
                  customBoardStyle={{
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  }}
                  customDarkSquareStyle={{ backgroundColor: "#1f2937" }}
                  customLightSquareStyle={{ backgroundColor: "#374151" }}
                />
                {gameOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center p-6 bg-gray-800/90 rounded-lg">
                      <div className={`text-3xl font-bold mb-4 ${
                        gameStatus.includes("Win") ? "text-green-400 animate-pulse" : 
                        gameStatus.includes("Draw") ? "text-yellow-400" : 
                        "text-white"
                      }`}>
                        {gameStatus}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                        Play Again
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col items-center space-y-4 w-full">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-xl shadow" />
                <div className="flex gap-4">
                  <button onClick={toggleVideo} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 flex items-center gap-2">
                    {isVideoEnabled ? <VideoCameraIcon className="w-5 h-5" /> : <NoSymbolIcon className="w-5 h-5" />}
                    {isVideoEnabled ? "Turn Video Off" : "Turn Video On"}
                  </button>
                  <button onClick={toggleAudio} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 flex items-center gap-2">
                    {isAudioEnabled ? <MicrophoneIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                    {isAudioEnabled ? "Mute" : "Unmute"}
                  </button>
                </div>
              </div>
            </div>

            <div className={`mt-4 text-center text-xl font-semibold ${
              gameStatus.includes("Win") ? "text-green-400" : 
              gameStatus.includes("Check") ? "text-red-400" : 
              "text-blue-400"
            }`}>
              {gameStatus}
              {playerColor && !gameOver && (
                <div className="text-sm text-gray-400 mt-1">
                  You're playing as {playerColor}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}