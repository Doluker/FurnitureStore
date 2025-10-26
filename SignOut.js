import { signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { auth } from './firebase.js';

async function signOutClient() {
    // ... ваша функция signOutClient остается прежней ...
    try {
        await signOut(auth);
        Swal.fire({
            icon: "success",
            title: "Выход выполнен",
            text: "Вы успешно вышли из системы.",
        }).then(() => {
            window.location.href = "index.html";
        });
    } catch (error) {
        console.error("Ошибка при выходе:", error);
        Swal.fire({
            icon: "error",
            title: "Ошибка",
            text: "Не удалось выйти из системы. Попробуйте снова.",
        });
    }
}

// 🔥 Оборачиваем весь код, прикрепляющий слушатели, в DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const signOutElement = document.getElementById('SignOut');
    const mobileSignOutElement = document.getElementById('MobileSignOut');

    if (signOutElement) {
        signOutElement.addEventListener('click', (e) => {
            e.preventDefault(); 
            signOutClient();
        });
    }

    if (mobileSignOutElement) {
        mobileSignOutElement.addEventListener('click', (e) => {
            e.preventDefault(); 
            signOutClient();
        });
    }
});