
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import GameModes from "./components/GameModes";
import ChessBoard from "./components/ChessBoard";
import Online from "./components/Online";
import BotGame from "./components/Bot";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/gamemods" element={<GameModes/>} />
        <Route path="/chessboard" element={<ChessBoard/>} />
        <Route path="/online" element={<Online/>} />
        <Route path="/bot" element= {<BotGame/>} />
        {/* <Route path="/home" element={<Home />} /> */}
      </Routes>
    </Router>
  );
}






