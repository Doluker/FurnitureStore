// Подключение необходимых модулей Firebase через CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

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

// Функция для входа пользователя
async function loginUser(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    
    const email = document.getElementById("login").value.trim();
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

        // Получаем данные из базы
        const authSnapshot = await get(ref(database, 'Authorization'));

        const users = authSnapshot.val() || {};

        // Находим пользователя
        const user = Object.values(users).find(u => u && u.Login === email && u.Password === password);
        
        if (!user) {
            throw new Error("Пользователь не найден");
        }
        // Определяем роль и перенаправляем
        const rolePages = {
            1: 'admin.html',    // Админ
            2: 'catalog.html',    // Пользователь
        };

        const redirectPage = rolePages[user.ID_Post] || 'personalaccount.html';
        window.location.href = redirectPage;

    } catch (error) {
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
document.querySelector('form').addEventListener('submit', loginUser);