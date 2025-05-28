
// import { useState, useEffect } from "react";
// import { Chess } from "chess.js";
// import { Chessboard } from "react-chessboard";
// import io from "socket.io-client";
// import { motion } from "framer-motion";
// import { UserGroupIcon } from "@heroicons/react/24/outline";

// const socket = io("http://localhost:5001");

// export default function Online() {
//   const [game, setGame] = useState(new Chess());
//   const [roomId, setRoomId] = useState("");
//   const [playerColor, setPlayerColor] = useState(null);
//   const [joined, setJoined] = useState(false);
//   const [selectedSquare, setSelectedSquare] = useState("");
//   const [validMoves, setValidMoves] = useState([]);

//   useEffect(() => {
//     socket.on("opponentMove", (move) => {
//       const newGame = new Chess(game.fen());
//       newGame.move(move);
//       setGame(newGame);
//     });

//     socket.on("assignColor", (color) => {
//       setPlayerColor(color);
//       setJoined(true);
//     });

//     return () => {
//       socket.off("opponentMove");
//       socket.off("assignColor");
//     };
//   }, [game]);

//   const handleSquareClick = (square) => {
//     if (game.isGameOver() || !joined || playerColor[0] !== game.turn()[0]) return;

//     if (selectedSquare) {
//       const move = {
//         from: selectedSquare,
//         to: square,
//         promotion: "q",
//       };

//       try {
//         const gameCopy = new Chess(game.fen());
//         const result = gameCopy.move(move);

//         if (result) {
//           setGame(gameCopy);
//           socket.emit("move", { roomId, move: result });
//           setSelectedSquare("");
//           setValidMoves([]);
//         }
//       } catch {
//         setSelectedSquare("");
//         setValidMoves([]);
//       }
//     } else {
//       const piece = game.get(square);
//       if (piece && piece.color === playerColor[0]) {
//         const moves = game.moves({ square, verbose: true });
//         setSelectedSquare(square);
//         setValidMoves(moves.map((m) => m.to));
//       }
//     }
//   };

//   const joinRoom = () => {
//     if (roomId.trim()) {
//       socket.emit("joinRoom", roomId);
//     }
//   };

//   const customSquareStyles = {
//     ...(selectedSquare && {
//       [selectedSquare]: {
//         backgroundColor: "rgba(255, 255, 0, 0.4)",
//       },
//     }),
//     ...validMoves.reduce((acc, curr) => {
//       acc[curr] = {
//         background:
//           "radial-gradient(circle, rgba(255,100,100,0.3) 25%, transparent 25%)",
//         borderRadius: "50%",
//       };
//       return acc;
//     }, {}),
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
//       <div className="max-w-4xl mx-auto">
//         {!joined ? (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="mb-6 flex flex-col items-center bg-white/5 p-6 rounded-xl backdrop-blur-sm"
//           >
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-xl backdrop-blur-sm"
//             >
//               <div className="flex items-center gap-4">
//                 <UserGroupIcon className="w-8 h-8 text-blue-400" />
//                 <h1 className="text-2xl font-bold text-white">Online Chess Room</h1>
//               </div>
//             </motion.div>
//             <input
//               type="text"
//               value={roomId}
//               onChange={(e) => setRoomId(e.target.value)}
//               placeholder="Enter Room ID"
//               className="mb-4 px-4 py-2 border border-gray-600 rounded text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <button
//               onClick={joinRoom}
//               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
//             >
//               Join Room
//             </button>
//           </motion.div>
//         ) : (
//           <div className="w-full">
//             <div className="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
//               <div className="flex items-center gap-4">
//                 <UserGroupIcon className="w-8 h-8 text-blue-400" />
//                 <h1 className="text-2xl font-bold text-white">Online Chess</h1>
//               </div>
//               <div className="text-blue-400">Room ID: {roomId}</div>
//             </div>

//             <div className="flex flex-col items-center">
//               <Chessboard
//                 position={game.fen()}
//                 onSquareClick={handleSquareClick}
//                 arePiecesDraggable={false}
//                 customSquareStyles={customSquareStyles}
//                 boardOrientation={playerColor}
//                 boardWidth={560}
//                 customBoardStyle={{
//                   borderRadius: "12px",
//                   boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
//                 }}
//                 customDarkSquareStyle={{ backgroundColor: "#1f2937" }}
//                 customLightSquareStyle={{ backgroundColor: "#374151" }}
//               />

//               <div className="mt-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm text-center w-full">
//                 <div className="text-xl font-semibold text-blue-400">
//                   {game.isGameOver()
//                     ? game.isCheckmate()
//                       ? game.turn() === "w"
//                         ? "Black Wins by Checkmate!"
//                         : "White Wins by Checkmate!"
//                       : game.isDraw()
//                       ? "Game Drawn!"
//                       : "Game Over"
//                     : game.inCheck()
//                     ? `${game.turn() === "w" ? "White" : "Black"} is in Check`
//                     : `${game.turn() === "w" ? "White" : "Black"} to move`}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef , useContext} from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import {useFirebase} from "../context/User"
import {getFirestore} from "firebase/firestore"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";


const socket = io("http://localhost:5001");

export default function Online() {
  const [game, setGame] = useState(new Chess());
  const [roomId, setRoomId] = useState("");
  const [playerColor, setPlayerColor] = useState(null);
  const [joined, setJoined] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState("");
  const [validMoves, setValidMoves] = useState([]);
  const [status, setStatus] = useState("Disconnected");
  const {app} = useFirebase()
  const db = getFirestore(app)

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(new MediaStream());
  const candidatesCollection = useRef(null);

  const mediaConstraints = {
    video: true,
    audio: true
  };

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        localStream.current = stream;
        localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Failed to get media:", err);
      }
    };

    initMedia();

    return () => {
      localStream.current?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!joined) return;

    socket.on("opponentMove", (move) => {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      setGame(newGame);
    });

    socket.on("assignColor", (color) => {
      setPlayerColor(color);
    });

    return () => {
      socket.off("opponentMove");
      socket.off("assignColor");
    };
  }, [joined, game]);

  const handleSquareClick = (square) => {
    if (game.isGameOver() || !joined || playerColor[0] !== game.turn()[0]) return;

    if (selectedSquare) {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: "q"
      };

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

  const joinRoom = async () => {
    if (!roomId.trim()) return;

    socket.emit("joinRoom", roomId);
    setJoined(true);
    setStatus("Joining Room...");
    await setupWebRTC(roomId, false);
  };

  const createPeerConnection = () => {
    const config = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };
    peerConnection.current = new RTCPeerConnection(config);

    localStream.current.getTracks().forEach(track =>
      peerConnection.current.addTrack(track, localStream.current)
    );

    peerConnection.current.ontrack = (event) => {
      remoteStream.current = event.streams[0];
      remoteVideoRef.current.srcObject = remoteStream.current;
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
        snapshot.docChanges().forEach(change => {
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
        snapshot.docChanges().forEach(change => {
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

  const toggleMedia = (type) => {
    const track = localStream.current?.getTracks().find((t) => t.kind === type);
    if (track) track.enabled = !track.enabled;
  };

  const customSquareStyles = {
    ...(selectedSquare && {
      [selectedSquare]: {
        backgroundColor: "rgba(255, 255, 0, 0.4)"
      }
    }),
    ...validMoves.reduce((acc, curr) => {
      acc[curr] = {
        background: "radial-gradient(circle, rgba(255,100,100,0.3) 25%, transparent 25%)",
        borderRadius: "50%"
      };
      return acc;
    }, {})
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-5xl mx-auto">
        {!joined ? (
          <motion.div className="mb-6 flex flex-col items-center bg-white/5 p-6 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserGroupIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Online Chess Room</h1>
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
          <div>
            <div className="flex justify-between items-center mb-6 p-4 bg-white/5 rounded-xl text-white">
              <div className="flex items-center gap-4">
                <UserGroupIcon className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl font-semibold">Room: {roomId}</h2>
              </div>
              <div>Status: {status}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <Chessboard
                  position={game.fen()}
                  onSquareClick={handleSquareClick}
                  arePiecesDraggable={false}
                  customSquareStyles={customSquareStyles}
                  boardOrientation={playerColor}
                  boardWidth={520}
                  customBoardStyle={{ borderRadius: "12px", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }}
                  customDarkSquareStyle={{ backgroundColor: "#1f2937" }}
                  customLightSquareStyle={{ backgroundColor: "#374151" }}
                />
                <div className="mt-4 text-blue-400 text-center font-medium">
                  {game.isGameOver()
                    ? game.isCheckmate()
                      ? game.turn() === "w" ? "Black Wins" : "White Wins"
                      : "Game Over"
                    : `${game.turn() === "w" ? "White" : "Black"} to move`}
                </div>
              </div>

              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between gap-4">
                  <button onClick={() => toggleMedia("video")} className="flex-1 py-2 bg-yellow-500 text-white rounded">
                    Toggle Video
                  </button>
                  <button onClick={() => toggleMedia("audio")} className="flex-1 py-2 bg-red-500 text-white rounded">
                    Toggle Audio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





