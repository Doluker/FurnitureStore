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
        const db = getDatabase(firebaseApp);

        // Функция для загрузки товаров из Firebase
        async function loadProducts() {
            try {
                const productGrid = document.getElementById('product-grid');
                productGrid.innerHTML = '<div class="col-span-full text-center py-8">Загрузка товаров...</div>';
                
                const querySnapshot = await db.collection("products").get();
                
                if (querySnapshot.empty) {
                    productGrid.innerHTML = '<div class="col-span-full text-center py-8">Товары не найдены</div>';
                    return;
                }
                
                productGrid.innerHTML = '';
                
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const productId = doc.id;
                    
                    // Определяем категорию для стилизации
                    let categoryClass = "";
                    let categoryText = "";
                    
                    if (product.category === "Гостиная") {
                        categoryClass = "living-room";
                        categoryText = "Гостиная";
                    } else if (product.category === "Спальня") {
                        categoryClass = "bedroom";
                        categoryText = "Спальня";
                    } else if (product.category === "Кухня") {
                        categoryClass = "kitchen";
                        categoryText = "Кухня";
                    }
                    
                    // Создаем карточку товара
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2';
                    productCard.setAttribute('data-category', categoryClass);
                    
                    productCard.innerHTML = `
                        <div class="h-56 overflow-hidden">
                            <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}" 
                                 alt="${product.name}" 
                                 class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
                        </div>
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-semibold text-secondary font-playfair">${product.name}</h3>
                                <span class="bg-accent text-secondary text-xs font-semibold px-2 py-1 rounded">${categoryText}</span>
                            </div>
                            <p class="text-gray-600 mb-4">${product.description}</p>
                            <div class="flex justify-between items-center">
                                <p class="text-primary font-bold text-lg">${product.price.toLocaleString('ru-RU')} руб.</p>
                                <button class="add-to-cart bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#6B3910] transition-colors duration-300 flex items-center" 
                                        data-id="${productId}" 
                                        data-name="${product.name}" 
                                        data-price="${product.price}">
                                    <i class="fas fa-cart-plus mr-2"></i> В корзину
                                </button>
                            </div>
                        </div>
                    `;
                    
                    productGrid.appendChild(productCard);
                });
                
                // Добавляем обработчики событий для кнопок корзины
                document.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', addToCart);
                });
                
            } catch (error) {
                console.error("Ошибка загрузки товаров: ", error);
                document.getElementById('product-grid').innerHTML = '<div class="col-span-full text-center py-8">Ошибка загрузки товаров</div>';
            }
        }

        // Функция добавления в корзину
        function addToCart(event) {
            const button = event.currentTarget;
            const productId = button.getAttribute('data-id');
            const productName = button.getAttribute('data-name');
            const productPrice = parseInt(button.getAttribute('data-price'));
            
            // Здесь можно добавить логику для добавления товара в корзину
            alert(`Товар "${productName}" добавлен в корзину!`);
            
            // Пример сохранения в localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        // Загружаем товары при загрузке страницы
        document.addEventListener('DOMContentLoaded', loadProducts);