import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// Конфигурация Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDnhSMYWVozNA64HO9nm7ZKDTOdvaFrzOI",
    authDomain: "furniturestore-909f0.firebaseapp.com",
    databaseURL: "https://furniturestore-909f0-default-rtdb.firebaseio.com",
    projectId: "furniturestore-909f0",
    storageBucket: "furniturestore-909f0.firebasestorage.app",
    messagingSenderId: "543600154960",
    appId: "1:543600154960:web:fe88956e216dde0c713455",
    measurementId: "G-JJK3BMB1SB"
  };

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
export { app, db, auth };