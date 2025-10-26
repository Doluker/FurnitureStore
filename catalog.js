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

    async function loadFavourites() {
        if (USER_ID == null) {
        userFavourites = {}; // Обнуляем список избранного
        return; 
        }
        
        try {
            const favouritesSnapshot = await get(ref(db, `Favourites/${USER_ID}`));
            console.log(USER_ID);
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

    // --- ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ ---
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
    
    function renderProducts(products) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) {
            console.error('Элемент #product-grid не найден!');
            return;
        }
        
        productGrid.innerHTML = '';
        
        products.forEach(product => {
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
    
    async function loadProducts() {
        try {
            // Загружаем избранное перед товарами
            await loadFavourites();
            
            const [catalogSnapshot, categorySnapshot] = await Promise.all([
                get(ref(db, 'Catalog')),
                get(ref(db, 'Category'))
            ]);
            
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
            
            renderProducts(allProducts);
            
        } catch (error) {
            console.error("Ошибка загрузки товаров:", error);
            const productGrid = document.getElementById('product-grid');
            if (productGrid) {
                productGrid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Ошибка загрузки</div>';
            }
        }
    }
    
    function searchProducts() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const searchText = searchInput.value.toLowerCase();
        const filtered = allProducts.filter(product => 
            product.Name.toLowerCase().includes(searchText) || 
            (product.Description && product.Description.toLowerCase().includes(searchText))
        );
        renderProducts(filtered);
    }
    
    
    // Добавляем обработчики событий
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchProducts);
    }
    
    // Обработчики для фильтров (если есть)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            console.log('Фильтр по категории:', category);
            // Реализуйте фильтрацию по категориям
        });
    });
    
    // Мобильное меню
    const mobileMenuButton = document.querySelector('.fa-bars')?.parentElement;
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            document.querySelector('.mobile-menu')?.classList.toggle('hidden');
        });
    }
});