import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import {auth } from './firebase.js';

function setupAuthListener() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Пользователь активен:", user.email);
      document.getElementById("SignIn").hidden = true;
      document.getElementById("Cart").hidden = false;
      document.getElementById("SignOut").hidden = false;
    } else {
      // Пользователь вышел или не вошел.
      console.log("Пользователь не авторизован.");
      document.getElementById("SignIn").hidden = false;
      document.getElementById("Cart").hidden = true;
      document.getElementById("SignOut").hidden = true;
    }
  });
}
setupAuthListener();