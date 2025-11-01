import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import {auth } from './firebase.js';

function setupAuthListener() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById('ProfileDropdown').classList.remove('hidden');
      document.getElementById("SignIn").classList.add('hidden');
      document.getElementById("MobileSignIn").hidden = true;
      document.getElementById("MobileCart").classList.add('flex');
      document.getElementById("MobileCart").hidden = false;
      document.getElementById("MobileFavourites").hidden = false;
      document.getElementById("MobileProfile").hidden = false;
      document.getElementById("MobileSignOut").hidden = false;
      document.getElementById('ProfileButton').hidden = false;
    } else {
      document.getElementById('ProfileDropdown').classList.add('hidden');
      document.getElementById("SignIn").classList.remove('hidden');
      document.getElementById("MobileSignIn").hidden = false;
      document.getElementById("MobileCart").classList.remove('flex');
      document.getElementById("MobileCart").hidden = true;
      document.getElementById("MobileFavourites").hidden = true;
      document.getElementById("MobileProfile").hidden = true;
      document.getElementById("MobileSignOut").hidden = true;
      document.getElementById('ProfileButton').hidden = true;
    }
  });
}
setupAuthListener();