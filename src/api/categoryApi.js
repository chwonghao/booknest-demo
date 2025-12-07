// MOCK IMPLEMENTATION
import { fetchProducts } from './productApi'; // Sử dụng productApi đã được mock

const mockCategories = [
    { id: 1, name: "Lịch sử" },
    { id: 2, name: "Tiểu thuyết" },
    { id: 3, name: "Kỹ năng sống" },
    { id: 4, name: "Khoa học" },
    { id: 5, name: "Kinh tế" },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchCategories() {
    await delay(300);
    console.log("MOCK: fetchCategories");
    return [...mockCategories];
}

export async function fetchCategoryById(id) {
    await delay(100);
    console.log("MOCK: fetchCategoryById", { id });
    const category = mockCategories.find(c => c.id.toString() === id.toString());
    return category || null;
}

export async function fetchProductsByCategory(id) {
    await delay(500);
    console.log("MOCK: fetchProductsByCategory", { id });
    // Tái sử dụng logic từ productApi đã được mock
    return fetchProducts({ categoryId: id });
}
