import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get, set} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

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
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

async function saveClient() {
event.preventDefault()
  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  if (!login || !password || !confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Ошибка",
      text: "Введите все поля!",
    });
    return;   
  }
  else if (password != confirmPassword){
    Swal.fire({
      icon: "error",
      title: "Ошибка",
      text: "Пароли не совпадают!",
    });
    return; 
  }
      const clientsRef = ref(database, "Authorization");
      const snapshot = await get(clientsRef);
      const nextId = snapshot.exists()
        ? Math.max(...Object.keys(snapshot.val()).map(Number)) + 1
        : 1;

      await set(ref(database, `Authorization/${nextId}`), {
        ID_Authorization: nextId,
        Login: login,
        Password: password,
        ID_Post: 2,
      });

      Swal.fire({
        icon: "success",
        title: "Успех",
        text: "Новый клиент добавлен!",
      });
      window.location.href = "catalog.html"
    }
document.querySelector('form').addEventListener('submit',saveClient)