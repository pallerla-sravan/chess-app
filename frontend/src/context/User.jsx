import { createContext, useContext, useEffect, useState } from "react";
import { getAuth,  } from "firebase/auth";
import { initializeApp } from "firebase/app";


const FirebaseContext = createContext();
const firebaseConfig = {
  apiKey: "AIzaSyD_JDN57_5SAvksA1IjDTaoR-sMAoJYUWs",
  authDomain: "chess-app-159f9.firebaseapp.com",
  projectId: "chess-app-159f9",
  storageBucket: "chess-app-159f9.firebasestorage.app",
  messagingSenderId: "237868117082",
  appId: "1:237868117082:web:3465b480745d9a9bde7c63",
  databaseURL:"https://chess-app-159f9-default-rtdb.firebaseio.com"
};


 const app = initializeApp(firebaseConfig);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);



  return (
    <FirebaseContext.Provider value={{ user , setUser, auth, app}}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use the Firebase context easily
export const useFirebase = () => useContext(FirebaseContext);
