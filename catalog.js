import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', function() {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    
    let allProducts = [];
    
    function createProductCard(product) {
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
                    <div class="flex justify-between items-center">
                        <p class="text-amber-600 font-bold text-lg">${product.Price ? product.Price.toLocaleString('ru-RU') : "0"} руб.</p>
                        <button class="add-to-cart bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-300 flex items-center" 
                                data-id="${product.ID_Catalog}" 
                                data-name="${product.Name}" 
                                data-price="${product.Price}">
                            <i class="fas fa-cart-plus mr-2"></i> В корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderProducts(products) {
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            productGrid.innerHTML += createProductCard(product);
        });
    }
    
    async function loadProducts() {
        try {
            const [catalogSnapshot, categorySnapshot] = await Promise.all([
                get(ref(db, 'Catalog')),
                get(ref(db, 'Category'))
            ]);
            
            if (!catalogSnapshot.exists()) {
                document.getElementById('product-grid').innerHTML = '<div class="col-span-full text-center py-8 text-gray-600">Товары не найдены</div>';
                return;
            }
            
            const catalogData = catalogSnapshot.val();
            const categoryData = categorySnapshot.exists() ? categorySnapshot.val() : {};
            console.log(catalogData)
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
                return product;
            });
            
            renderProducts(allProducts);
            
        } catch (error) {
            console.error("Ошибка загрузки товаров:", error);
            document.getElementById('product-grid').innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Ошибка загрузки</div>';
        }
    }
    
    function searchProducts() {
        const searchText = document.getElementById('searchInput').value.toLowerCase();
        const filtered = allProducts.filter(product => 
            product.Name.toLowerCase().includes(searchText) || 
            (product.Description && product.Description.toLowerCase().includes(searchText))
        );
        renderProducts(filtered);
    }
    
    // Инициализация
    loadProducts();
    
    document.getElementById('searchInput').addEventListener('input', searchProducts);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterProducts(this.getAttribute('data-category'));
        });
    });
    
    document.querySelector('.fa-bars').parentElement.addEventListener('click', function() {
        document.querySelector('.mobile-menu').classList.toggle('hidden');
    });
});