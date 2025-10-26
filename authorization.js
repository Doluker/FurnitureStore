// Подключение необходимых модулей Firebase через CDN
import { ref, get } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { db, auth } from './firebase.js';

// Функция для входа пользователя
async function SignIn(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginButton = document.getElementById("loginbutton");

    // Валидация формы
    if (!email || !password) {
        Swal.fire({
            icon: "error",
            title: "Ошибка",
            text: "Введите логин и пароль!",
        });
        return;
    }

    try {
        // Показываем индикатор загрузки
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="loading">Вход...</span>';
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;
        const clientRef = ref(db, `Authorization/${uid}`);
        const snapshot = await get(clientRef);

        let userRole = 0;
        if (snapshot.exists()) {
            userRole = snapshot.val().ID_Post; // Получаем роль
        }
        // Определяем роль и перенаправляем
        const rolePages = {
            1: 'admin.html',    // Админ
            2: 'catalog.html',    // Пользователь
        };
        const redirectPage = rolePages[userRole]
        // 4. Успешный вход
        Swal.fire({
            icon: "success",
            title: "Вход успешен",
            text: `Добро пожаловать!.`,
        }).then(() => {
             // 5. Перенаправление или обновление UI
             window.location.href = redirectPage; 
        });
        }
        catch (error) {
        console.error('Ошибка входа:', error);
        Swal.fire({
            icon: "error",
            title: "Ошибка входа",
            text: error.message === "Пользователь не найден" 
                ? "Неправильный логин или пароль!" 
                : "Произошла ошибка при входе. Попробуйте позже.",
        });
    } finally {
        // Восстанавливаем кнопку в любом случае
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Войти';
        }
    }
}

// Добавляем обработчик на форму, а не на кнопку
document.querySelector('form').addEventListener('submit', SignIn);