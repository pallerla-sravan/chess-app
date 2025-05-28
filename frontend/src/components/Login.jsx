import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GameModes from "./GameModes";
import { GoogleAuthProvider, signInWithPopup , onAuthStateChanged, createUserWithEmailAndPassword} from "firebase/auth";
import {useFirebase} from "../context/User"


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {user, setUser, auth} = useFirebase()
  // const navigate = useNavigate();

  const provider = new GoogleAuthProvider();

  useEffect(()=>{
    onAuthStateChanged(auth, (user)=>{
      user?setUser(user):setUser()
    })
  },[])

  const handleEmailLogin = () => {
    if (email.trim() && password.trim()) {
      createUserWithEmailAndPassword(auth, email, password).then((usercre)=>{console.log(usercre)}).catch((error)=>{
        console.log(error)
      })
    }
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Google sign-in successful:", result.user.displayName);
        // navigate("/gamemods");
      })
      .catch((error) => {
        console.error("Google sign-in error:", error);
      });
  };

  return (
    <>
    {user? <GameModes/> : (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">CHESS WORLD</h2>

        <input
          type="email"
          placeholder="Enter your email id"
          // value={username}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 text-white bg-white/20 border border-white/30 rounded-lg mb-4 focus:outline-none focus:ring-4 focus:ring-purple-300 placeholder-white/70"
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          // value={username}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 text-white bg-white/20 border border-white/30 rounded-lg mb-4 focus:outline-none focus:ring-4 focus:ring-purple-300 placeholder-white/70"
          required
        />

        <motion.button
          onClick={handleEmailLogin}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg font-semibold tracking-wide uppercase shadow-lg mb-4 hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Login
        </motion.button>

        <div className="text-center text-white/70 mb-2">or</div>

        <motion.button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-gray-800 p-3 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google icon"
            className="w-5 h-5"
          />
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
    )}
    </>
  );
}
