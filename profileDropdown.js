// profileDropdown.js

document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('ProfileButton');
    const profileMenu = document.getElementById('ProfileMenu');
    const profileDropdown = document.getElementById('ProfileDropdown');
    
    if (profileButton && profileMenu && profileDropdown) {
        
        // 1. Функция для переключения видимости меню
        const toggleMenu = () => {
            const isExpanded = profileButton.getAttribute('aria-expanded') === 'true';
            
            // Переключаем Tailwind классы (hidden <-> block)
            profileMenu.classList.toggle('hidden');

            // Обновляем состояние aria-expanded для доступности
            profileButton.setAttribute('aria-expanded', String(!isExpanded));
        };

        // 2. Обработчик для кнопки: открывает/закрывает меню
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Останавливаем всплытие, чтобы не сработал обработчик закрытия
            toggleMenu();
        });

        // 3. Закрываем меню при клике вне его
        document.addEventListener('click', (event) => {
            // Если меню открыто И клик был вне всего компонента профиля, то закрываем
            if (!profileMenu.classList.contains('hidden') && !profileDropdown.contains(event.target)) {
                toggleMenu(); 
            }
        });
        
        // 4. Закрываем меню при нажатии клавиши ESC
        document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape' && !profileMenu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
        
        // Убедимся, что компонент по умолчанию скрыт,
        // если его видимость контролируется файлом AuthorizationState.js
    }
});