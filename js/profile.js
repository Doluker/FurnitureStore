import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    
    // Элементы DOM
    const loadingSpinner = document.getElementById('loading-spinner');
    const profileContent = document.getElementById('profile-content');
    
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userPhotoElement = document.getElementById('user-photo');
    const userRegistrationDateElement = document.getElementById('user-registration-date');
    const userUidElement = document.getElementById('user-uid');
    const logoutButton = document.getElementById('logout-button');

    // Функция для форматирования даты
    function formatDate(timestamp) {
        if (!timestamp) return 'Неизвестно';
        const date = new Date(Number(timestamp));
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Обработчик изменения состояния авторизации
    onAuthStateChanged(auth, (user) => {
        
        // Скрываем все
        loadingSpinner.classList.add('hidden');
        profileContent.classList.add('hidden');

        if (user) {

            profileContent.classList.remove('hidden');

            // Заполняем данные
            const displayName = user.displayName || 'Пользователь';
            const email = user.email || 'Нет данных';
            const photoURL = user.photoURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfdeQHOYCOXOexK_QDEY3Ws_lkCY8mWEfRuQ&s';
            const metadata = user.metadata;
            
            userNameElement.textContent = displayName;
            userEmailElement.textContent = email;
            userPhotoElement.src = photoURL;
            userUidElement.textContent = `ID: ${user.uid.substring(0, 8)}...`; // Показываем часть UID
            
            if (metadata && metadata.creationTime) {
                userRegistrationDateElement.textContent = formatDate(metadata.createdAt);
            } else {
                 userRegistrationDateElement.textContent = 'Нет данных';
            }

        } else {
            window.location.href = "index.html"
        }
    });

    // Обработчик кнопки "Выйти"
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            Swal.fire({
                title: 'Вы уверены?',
                text: "Вы будете перенаправлены на главную страницу.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#8B4513',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Да, выйти',
                cancelButtonText: 'Отмена'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await signOut(auth);
                        // Перенаправляем на главную или страницу входа после выхода
                        window.location.href = 'index.html'; 
                    } catch (error) {
                        console.error('Ошибка выхода:', error);
                        Swal.fire({
                            icon: "error",
                            title: "Ошибка",
                            text: "Не удалось выйти из аккаунта. Попробуйте еще раз.",
                        });
                    }
                }
            });
        });
    }
});