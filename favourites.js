import { ref, get, set, remove} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db, auth } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    let USER_ID = null; 
    let allProducts = [];
    let userFavourites = {};
    const productGrid = document.getElementById('product-grid');
    const noFavouritesMessage = document.getElementById('no-favourites-message');

    // Наблюдатель за состоянием авторизации
    onAuthStateChanged(auth, (user) => {
        if (user) {
            USER_ID = user.uid;
            loadProducts() 
        } else {
            USER_ID = null;
            window.location.href = "index.html"
        }
    });

    /**
     * Загружает избранные товары пользователя из Firebase.
     */
    async function loadFavourites() {
        if (USER_ID == null) {
            userFavourites = {}; 
            return; 
        }
        
        try {
            const favouritesSnapshot = await get(ref(db, `Favourites/${USER_ID}`));
            if (favouritesSnapshot.exists()) {
                const favouritesData = favouritesSnapshot.val();
                userFavourites = {};
                Object.keys(favouritesData).forEach(productId => {
                    // Используем ID_Catalog как ключ в объекте userFavourites
                    userFavourites[String(favouritesData[productId].ID_Catalog)] = true; 
                });
            } else {
                 userFavourites = {};
            }
        } catch (error) {
            console.error("Ошибка загрузки избранного:", error);
            Swal.fire({
                icon: "error",
                title: "Ошибка",
                text: "Не удалось загрузить избранное.",
            });
        }
    }

    /**
     * Переключает статус избранного в UI и Firebase.
     */
    async function toggleFavouriteStatus(button, productId, isCurrentlyFavourite) {
        if (USER_ID == null) {
            Swal.fire({
                icon: "error",
                title: "Ошибка",
                text: "Войдите в учетную запись для управления избранным.",
            });
            return;
        }
        
        const newState = !isCurrentlyFavourite;
        const icon = button.querySelector('i');
        
        // Оптимистичное обновление UI
        icon.classList.remove(isCurrentlyFavourite ? 'fas' : 'far');
        icon.classList.add(newState ? 'fas' : 'far');
        button.setAttribute('data-favorite', newState.toString());
        
        try {
            const productRef = ref(db, `Favourites/${USER_ID}/${productId}`);
            
            if (newState) {
                // Добавление в избранное (хотя на этой странице все товары уже избранные)
                await set(productRef, {
                    ID_Catalog: Number(productId),
                    IsFavourite: true
                });
                userFavourites[productId] = true;
            } else {
                // Удаление из избранного
                await remove(productRef);
                delete userFavourites[productId];
                
                // На странице избранного, мы должны удалить карточку после удаления из Firebase
                const card = button.closest('.product-card');
                if (card) {
                    card.remove();
                }
            }
            
            // Проверяем, осталось ли что-нибудь в избранном после удаления
            const remainingCards = productGrid.querySelectorAll('.product-card').length;
            if (remainingCards === 0) {
                 noFavouritesMessage.classList.remove('hidden');
            }

        } catch (error) {
            console.error(`Ошибка записи избранного для ID ${productId}:`, error);
            
            // Откат UI в случае ошибки
            icon.classList.remove(newState ? 'fas' : 'far');
            icon.classList.add(isCurrentlyFavourite ? 'fas' : 'far');
            button.setAttribute('data-favorite', isCurrentlyFavourite.toString());
            
            Swal.fire({
                icon: "error",
                title: "Ошибка",
                text: "Не удалось сохранить изменения. Попробуйте еще раз.",
            });
        }
    }

    // --- ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ (та же, что и в catalog.js) ---
    function createProductCard(product) {
        const isFavourite = userFavourites[product.ID_Catalog] === true;
        const starClass = isFavourite ? 'fas' : 'far';

        return `
            <div class="product-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2" data-category="${product.categoryClass}">
    <div class="h-56 overflow-hidden">
        <img src="${product.ImageURL}" 
            alt="${product.Name}" 
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
    </div>
    <div class="p-6">
        <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-semibold text-secondary">${product.Name}</h3>
            <span class="bg-amber-500 text-gray-900 text-xs font-semibold px-2 py-1 rounded">${product.categoryName}</span>
        </div>
        <p class="text-gray-600 mb-4">${product.Description || 'Описание отсутствует'}</p>
        
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            
            <p class="text-amber-600 font-bold text-lg mb-4 sm:mb-0">${product.Price ? product.Price.toLocaleString('ru-RU') : "0"} руб.</p>
            
            <div class="flex space-x-2 w-full sm:w-auto">

                <button class="favorite-toggle text-primary bg-primary/10 w-10 h-10 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors duration-200 focus:outline-none flex-shrink-0"
                    data-favorite="${isFavourite ? 'true' : 'false'}"
                    data-product-id="${product.ID_Catalog}"
                    title="Убрать из избранного">
                    <i class="${starClass} fa-star text-lg"></i> </button>
                
                <button class="add-to-cart bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-300 flex items-center justify-center flex-grow" 
                    data-id="${product.ID_Catalog}" 
                    data-name="${product.Name}" 
                    data-price="${product.Price}">
                    <i class="fas fa-cart-plus mr-2"></i> В корзину
                </button>
            </div>
        </div>
    </div>
</div>
        `;
    }
    
    /**
     * Отрисовывает только избранные товары.
     */
    function renderProducts(products) {
        if (!productGrid) {
            console.error('Элемент #product-grid не найден!');
            return;
        }
        
        // Фильтруем все товары, оставляя только те, которые есть в userFavourites
        const favouriteProducts = products.filter(product => 
            userFavourites.hasOwnProperty(product.ID_Catalog)
        );
        
        productGrid.innerHTML = '';
        
        if (favouriteProducts.length === 0) {
            noFavouritesMessage.classList.remove('hidden');
        } else {
            noFavouritesMessage.classList.add('hidden');
            favouriteProducts.forEach(product => {
                productGrid.innerHTML += createProductCard(product);
            });
        }
        
        // Добавляем обработчики для кнопок избранного (теперь они для удаления)
        document.querySelectorAll('.favorite-toggle').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                const isCurrentlyFavourite = this.getAttribute('data-favorite') === 'true';
                
                // На этой странице нажатие всегда означает удаление
                toggleFavouriteStatus(this, productId, isCurrentlyFavourite);
            });
        });
        
        // Добавляем обработчики для кнопок корзины (логика корзины не меняется)
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = this.getAttribute('data-price');
                console.log('Добавлено в корзину:', { id, name, price });
                // Здесь можно добавить логику для корзины, как в catalog.js
            });
        });
    }
    
    /**
     * Главная функция загрузки данных.
     */
    async function loadProducts() {
        if (USER_ID == null) return; // Условие для неавторизованных уже обработано в onAuthStateChanged

        try {
            // Загружаем избранное ПЕРЕД товарами
            await loadFavourites();
            
            const [catalogSnapshot, categorySnapshot] = await Promise.all([
                get(ref(db, 'Catalog')),
                get(ref(db, 'Category'))
            ]);
            
            if (!catalogSnapshot.exists()) {
                 productGrid.innerHTML = '';
                 noFavouritesMessage.classList.remove('hidden');
                 return;
            }
            
            const catalogData = catalogSnapshot.val();
            const categoryData = categorySnapshot.exists() ? categorySnapshot.val() : {};
            
            allProducts = Object.keys(catalogData).map(key => {
                const product = catalogData[key];
                product.key = key;
                
                let categoryName = "Неизвестно";
                let categoryClass = "";
                
                Object.keys(categoryData).forEach(catKey => {
                    const category = categoryData[catKey];
                    if (category.ID_Category === product.ID_Category) {
                        categoryName = category.Name;
                        categoryClass = category.Name.toLowerCase().replace(' ', '-');
                    }
                });
                
                product.categoryName = categoryName;
                product.categoryClass = categoryClass;
                product.ID_Catalog = String(product.ID_Catalog);
                
                return product;
            });
            
            renderProducts(allProducts); // Рендерим только отфильтрованные избранные товары
            
        } catch (error) {
            console.error("Ошибка загрузки товаров:", error);
            if (productGrid) {
                 productGrid.innerHTML = '';
                 noFavouritesMessage.classList.remove('hidden');
                 noFavouritesMessage.querySelector('p').textContent = 'Произошла ошибка при загрузке данных.';
                 noFavouritesMessage.querySelector('a').classList.add('hidden'); // Скрываем ссылку
            }
        }
    }

    // Мобильное меню (оставляем для полноты)
    const mobileMenuButton = document.querySelector('.fa-bars')?.parentElement;
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.mobile-menu')?.classList.toggle('hidden');
        });
    }
});