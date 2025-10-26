import { signOut} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { auth } from './firebase.js';

async function signOutClient() {
    try {
        await signOut(auth);
        Swal.fire({
            icon: "success",
            title: "Выход выполнен",
            text: "Вы успешно вышли из системы.",
        }).then(() => {
             window.location.href = "index.html"
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
// ✅ Правильный поиск по ID
const signOutElement = document.getElementById('SignOut');

// ❌ Неправильное событие 'submit', нужно 'click'
if (signOutElement) {
    signOutElement.addEventListener('click', (e) => {
        // ... ваша функция выхода
        e.preventDefault(); 
        signOutClient();
    });
}