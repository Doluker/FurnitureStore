import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import {auth } from './firebase.js';

function setupAuthListener() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById('ProfileDropdown').classList.remove('hidden');
      document.getElementById("SignIn").hidden = true;
      document.getElementById("MobileSignIn").hidden = true;
      document.getElementById("MobileCart").hidden = false;
      document.getElementById("MobileCart").classList.add('flex');
      document.getElementById("MobileSignOut").hidden = false;
      document.getElementById('ProfileButton').hidden = false;
    } else {
      document.getElementById('ProfileDropdown').classList.add('hidden');
      document.getElementById("SignIn").hidden = false;
      document.getElementById("MobileSignIn").hidden = false;
      document.getElementById("MobileCart").hidden = true;
      document.getElementById("MobileSignOut").hidden = true;
      document.getElementById('ProfileButton').hidden = true;
    }
  });
}
setupAuthListener();