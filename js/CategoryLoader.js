import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { db } from './firebase.js'; // Убедитесь, что db экспортируется из вашего firebase.js

document.addEventListener('DOMContentLoaded', loadCategories);

function createCategoryCard(categoryData) {
    const defaultImage = 'https://via.placeholder.com/1350x800.png?text=Мебель';
    
    // Используем 'Гостиная' в качестве примера Name, если он отсутствует
    const name = categoryData.Name || 'Неизвестная категория';
    
    // Используем 'Диваны, кресла...' в качестве примера Description, если оно отсутствует
    const description = categoryData.Description || 'Посмотрите наши лучшие товары в этой категории.';
    
    // Используем 15000 в качестве примера Price, если оно отсутствует
    const price = categoryData.Price ? categoryData.Price.toLocaleString('ru-RU') : '0';
    
    // Используем URL изображения из базы данных или заглушку
    const imageUrl = categoryData.ImageURL || defaultImage;

    return `
        <div class="service-card bg-light rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2">
            <div class="h-48 overflow-hidden">
                <div class="service-image h-full bg-cover bg-center" 
                     style="background-image: url('${imageUrl}');">
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold text-secondary mb-2">${name}</h3>
                <p class="text-gray-600 mb-4">${description}</p>
                <p class="text-primary font-bold text-lg">от ${price} руб.</p>
            </div>
        </div>
    `;
}

async function loadCategories() {
    const categoryGrid = document.getElementById('category-grid');
    if (!categoryGrid) {
        console.error('Контейнер #category-grid не найден!');
        return;
    }

    try {
        const categoryRef = ref(db, 'Category');
        const snapshot = await get(categoryRef);

        if (snapshot.exists()) {
            const categories = snapshot.val();
            let htmlContent = '';
            
            Object.keys(categories).forEach(key => {
                const categoryData = categories[key];
                htmlContent += createCategoryCard(categoryData);
            });

            categoryGrid.innerHTML = htmlContent;
        } else {
            categoryGrid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-600">Категории не найдены</div>';
        }
    } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
        categoryGrid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Ошибка загрузки категорий.</div>';
    }
}