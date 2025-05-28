import { motion } from "framer-motion";
import { 
  UserIcon, 
  CpuChipIcon, 
  GlobeAltIcon, 
  HomeIcon 
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {useFirebase} from "../context/User"

export default function GameModes() {
  const nav = useNavigate()
  const {user} = useFirebase()
  const gameModes = [
    {
      id: 1,
      title: "Play with Friend",
      description: "Challenge a friend on the same device",
      icon: <UserIcon className="w-12 h-12 text-white" />,
      color: "bg-blue-500",
      path:"/chessboard"
    },
    {
      id: 2,
      title: "Play with Bot",
      description: "Test your skills against AI",
      icon: <CpuChipIcon className="w-12 h-12 text-white" />,
      color: "bg-green-500",
      path:"/bot"
    },
    {
      id: 3,
      title: "Play Online",
      description: "Compete with players worldwide",
      icon: <GlobeAltIcon className="w-12 h-12 text-white" />,
      color: "bg-purple-500",
      path:"/online"
    },
  ];

  const handleGameModeSelect = (mode) =>{
    console.log(mode,"you should print the id here man")
    if(mode.id == 1) nav(mode.path)
    else if(mode.id == 2) nav(mode.path)
    else if(mode.id == 3) nav(mode.path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white/5 backdrop-blur-md shadow-lg fixed w-full top-0 z-50 pb-">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex-shrink-0 flex items-center"
              >
                <div className="text-white text-xl font-bold flex items-center">
                  <span className="text-3xl mr-2">♔</span>
                  ChessHub
                </div>
              </motion.div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Home
                </motion.button>

                <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                  <img
                    src="https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg"
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full mr-2 border border-white/20"
                  />
                  <span className="text-sm font-medium">{user?.displayName || "Guest"}</span>

                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-[13%] pb-12 px-4 sm:px-6 lg:px-8 ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center text-white mb-12">
            Choose Your Game Mode
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {gameModes.map((mode) => (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-8 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => handleGameModeSelect(mode)}
              >
                <motion.div
                  className={`p-4 rounded-full mb-6 ${mode.color}`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {mode.icon}
                </motion.div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {mode.title}
                </h2>
                <p className="text-gray-400 text-center">{mode.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}