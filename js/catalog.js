import { ref, get, set, remove} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db, auth } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    let USER_ID = null; 
    onAuthStateChanged(auth, (user) => {
        if (user) {
           USER_ID = user.uid;
           loadProducts() 
        } else {
           loadProducts()
        }
    });
    
    let allProducts = [];
    let userFavourites = {};
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect'); // Новый элемент

    // ... (Функции loadFavourites и toggleFavouriteStatus остаются без изменений) ...
    async function loadFavourites() {
        if (USER_ID == null) {
        userFavourites = {}; // Обнуляем список избранного
        return; 
        }
        
        try {
            const favouritesSnapshot = await get(ref(db, `Favourites/${USER_ID}`));
            if (favouritesSnapshot.exists()) {
                const favouritesData = favouritesSnapshot.val();
                userFavourites = {};
                Object.keys(favouritesData).forEach(productId => {
                    const item = favouritesData[productId];
                    if (item && item.IsFavourite !== undefined) {
                        userFavourites[productId] = item.IsFavourite;
                    }
                });
            }
        } catch (error) {
            console.error("Ошибка загрузки избранного:", error);
        }
    }

    async function toggleFavouriteStatus(button, productId, isCurrentlyFavourite) {
        if (USER_ID != null) {
        const newState = !isCurrentlyFavourite;
        const icon = button.querySelector('i');
        
        icon.classList.remove(isCurrentlyFavourite ? 'fas' : 'far');
        icon.classList.add(newState ? 'fas' : 'far');
        button.setAttribute('data-favorite', newState.toString());
        
        try {
            const productRef = ref(db, `Favourites/${USER_ID}/${productId}`);
            
            if (newState) {
                await set(productRef, {
                    ID_Catalog: Number(productId),
                    IsFavourite: true
                });
                userFavourites[productId] = true;
            } else {
                await remove(productRef);
                delete userFavourites[productId];
            }
            
            console.log(`Товар ${productId} ${newState ? 'добавлен в' : 'удален из'} избранного`);

        } catch (error) {
            console.error(`Ошибка записи избранного для ID ${productId}:`, error);
            
            // Откат UI
            icon.classList.remove(newState ? 'fas' : 'far');
            icon.classList.add(isCurrentlyFavourite ? 'fas' : 'far');
            button.setAttribute('data-favorite', isCurrentlyFavourite.toString());
            
            alert('Не удалось сохранить изменения. Попробуйте еще раз.');
        }
        }
        else {
            Swal.fire({
            icon: "error",
            title: "Ошибка добавления в избранное",
            text: "Войдите в учетную запись",
        });
        }
    }

    // --- ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ (Остается без изменений) ---
    function createProductCard(product) {
        // ... (Ваша функция createProductCard) ...
         const isFavourite = userFavourites[product.ID_Catalog] === true;
         const starClass = isFavourite ? 'fas' : 'far';

         return `
             <div class="product-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 flex flex-col h-full" data-category="${product.categoryClass}">
     <div class="h-56 overflow-hidden flex-shrink-0">
         <img src="${product.ImageURL}" loading="lazy" alt="${product.Name}" 
             class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
     </div>
     
     <div class="p-6 flex-grow flex flex-col justify-between">
         
         <div>
             <div class="flex justify-between items-start mb-2">
                 <h3 class="text-xl font-semibold text-secondary">${product.Name}</h3>
                 <span class="bg-amber-500 text-gray-900 text-xs font-semibold px-2 py-1 rounded">${product.categoryName}</span>
             </div>
             <p class="text-gray-600 mb-4">${product.Description || 'Описание отсутствует'}</p>
         </div>
         
         <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-auto">
             
             <p class="text-amber-600 font-bold text-lg mb-4 sm:mb-0">${product.Price ? product.Price.toLocaleString('ru-RU') : "0"} руб.</p>
             
             <div class="flex space-x-2 w-full sm:w-auto">

                 <button class="favorite-toggle text-primary bg-primary/10 w-10 h-10 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors duration-200 focus:outline-none flex-shrink-0"
                     data-favorite="${isFavourite ? 'true' : 'false'}"
                     data-product-id="${product.ID_Catalog}"
                     title="Добавить в избранное">
                     <i class="${starClass} fa-star text-lg"></i>
                 </button>
                 
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
    
    // --- ФУНКЦИЯ РЕНДЕРИНГА (ОБНОВЛЕНА) ---
    function renderProducts(products) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) {
            console.error('Элемент #product-grid не найден!');
            return;
        }
        
        // 1. СОРТИРОВКА перед рендерингом
        const sortedProducts = sortProducts(products);
        
        productGrid.innerHTML = '';
        
        if (sortedProducts.length === 0) {
            productGrid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-600">Ничего не найдено.</div>';
            return;
        }

        sortedProducts.forEach(product => {
            productGrid.innerHTML += createProductCard(product);
        });
        
        // Добавляем обработчики для кнопок избранного
        document.querySelectorAll('.favorite-toggle').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                const isCurrentlyFavourite = this.getAttribute('data-favorite') === 'true';
                toggleFavouriteStatus(this, productId, isCurrentlyFavourite);
            });
        });
        
        // Добавляем обработчики для кнопок корзины
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = this.getAttribute('data-price');
                console.log('Добавлено в корзину:', { id, name, price });
                // Здесь можно добавить логику для корзины
            });
        });
    }

    function sortProducts(products) {
        const sortBy = sortSelect ? sortSelect.value : 'default';
        
        const sorted = [...products];

        sorted.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return (a.Price || 0) - (b.Price || 0);
                case 'price-desc':
                    return (b.Price || 0) - (a.Price || 0);
                case 'name-asc':
                    return a.Name.localeCompare(b.Name, 'ru', { sensitivity: 'base' });
                case 'name-desc':
                    return b.Name.localeCompare(a.Name, 'ru', { sensitivity: 'base' });
                case 'default':
                default:
                    return a.ID_Catalog - b.ID_Catalog; 
            }
        });
        
        return sorted;
    }
    
    // --- ФУНКЦИЯ ФИЛЬТРАЦИИ И ПОИСКА (ОБНОВЛЕНА) ---
    function searchAndFilterProducts() {
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filtered = allProducts.filter(product => 
            product.Name.toLowerCase().includes(searchText) || 
            (product.Description && product.Description.toLowerCase().includes(searchText))
        );
        
        // Теперь renderProducts автоматически применит сортировку к отфильтрованному списку
        renderProducts(filtered);
    }
    
    
    async function loadProducts() {
        try {
            // Загружаем избранное перед товарами
            await loadFavourites();
            
            const [catalogSnapshot, categorySnapshot] = await Promise.all([
                get(ref(db, 'Catalog')),
                get(ref(db, 'Category'))
            ]);
            
            // ... (логика загрузки и маппинга данных остается прежней)
            if (!catalogSnapshot.exists()) {
                const productGrid = document.getElementById('product-grid');
                if (productGrid) {
                    productGrid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-600">Товары не найдены</div>';
                }
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
            
            // Вызываем общий фильтр/поиск/сортировку
            searchAndFilterProducts(); 
            
        } catch (error) {
            console.error("Ошибка загрузки товаров:", error);
            const productGrid = document.getElementById('product-grid');
            if (productGrid) {
                productGrid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Ошибка загрузки</div>';
            }
        }
    }
    
    
    // Добавляем обработчики событий
    if (searchInput) {
        searchInput.addEventListener('input', searchAndFilterProducts); // Теперь вызывает общую функцию
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', searchAndFilterProducts); // Новый обработчик для сортировки
    }
    
    // ... (Остальные обработчики, такие как мобильное меню, остаются без изменений)
    const mobileMenuButton = document.querySelector('.fa-bars')?.parentElement;
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.mobile-menu')?.classList.toggle('hidden');
        });
    }
});