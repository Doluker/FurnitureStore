// navigation.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Логика для мобильного меню
    const mobileMenuButton = document.querySelector('.fa-bars')?.parentElement;
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Логика плавной прокрутки для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Плавная прокрутка
                window.scrollTo({
                    // top: targetElement.offsetTop - 80, // Вычитаем высоту шапки (80px)
                    top: targetElement.getBoundingClientRect().top + window.scrollY - 80, 
                    behavior: 'smooth'
                });
                
                // Закрываем мобильное меню после клика, если оно открыто
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
});