// MOCK IMPLEMENTATION
const mockProducts = [
  {
    id: 1,
    name: "Lược Sử Loài Người",
    authors: [{ id: 1, name: "Yuval Noah Harari" }],
    price: 150000,
    originalPrice: 200000,
    stockQuantity: 10,
    description: "Một cuốn sách khám phá lịch sử của loài người từ thời kỳ đồ đá đến thế kỷ 21.",
    imageUrl: "https://d2g9fy2x2d42kj.cloudfront.net/e7/21/49/9a/e721499a-3a47-4530-9e57-2e526771c9da.jpeg",
    categories: [{ id: 1, name: "Lịch sử" }],
    isFeatured: true,
    publisher: "NXB Tri Thức",
    publishedDate: "2014-01-01",
    pages: 512,
    language: "Tiếng Việt",
    isbn: "978-604-943-499-9",
    averageRating: 4.8,
    ratingCount: 1250,
  },
  {
    id: 2,
    name: "Nhà Giả Kim",
    authors: [{ id: 2, name: "Paulo Coelho" }],
    price: 79000,
    originalPrice: 99000,
    stockQuantity: 25,
    description: "Câu chuyện về chàng chăn cừu Santiago và hành trình theo đuổi vận mệnh của mình.",
    imageUrl: "https://d2g9fy2x2d42kj.cloudfront.net/e7/21/49/9a/e721499a-3a47-4530-9e57-2e526771c9da.jpeg",
    categories: [{ id: 2, name: "Tiểu thuyết" }],
    isFeatured: true,
    publisher: "NXB Văn Học",
    publishedDate: "1988-01-01",
    pages: 208,
    language: "Tiếng Việt",
    isbn: "978-604-968-090-7",
    averageRating: 4.7,
    ratingCount: 3400,
  },
  {
    id: 3,
    name: "Đắc Nhân Tâm",
    authors: [{ id: 3, name: "Dale Carnegie" }],
    price: 88000,
    originalPrice: 110000,
    stockQuantity: 0, // Hết hàng
    description: "Nghệ thuật giao tiếp và ứng xử để đạt được thành công trong cuộc sống.",
    imageUrl: "https://d2g9fy2x2d42kj.cloudfront.net/e7/21/49/9a/e721499a-3a47-4530-9e57-2e526771c9da.jpeg",
    categories: [{ id: 3, name: "Kỹ năng sống" }],
    isFeatured: false,
    publisher: "NXB Tổng hợp TP.HCM",
    publishedDate: "1936-01-01",
    pages: 320,
    language: "Tiếng Việt",
    isbn: "978-604-58-5883-7",
    averageRating: 4.6,
    ratingCount: 5600,
  },
  {
    id: 4,
    name: "Sapiens: Lược Sử Tương Lai",
    authors: [{ id: 1, name: "Yuval Noah Harari" }],
    price: 165000,
    originalPrice: 220000,
    stockQuantity: 5,
    description: "Khám phá những dự án, giấc mơ và ác mộng sẽ định hình thế kỷ 21.",
    imageUrl: "https://d2g9fy2x2d42kj.cloudfront.net/e7/21/49/9a/e721499a-3a47-4530-9e57-2e526771c9da.jpeg",
    categories: [{ id: 1, name: "Lịch sử" }, { id: 4, name: "Khoa học" }],
    isFeatured: false,
    publisher: "NXB Tri Thức",
    publishedDate: "2016-01-01",
    pages: 464,
    language: "Tiếng Việt",
    isbn: "978-604-89-0294-7",
    averageRating: 4.9,
    ratingCount: 980,
  },
];
let nextProductId = 5;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchProducts({ type, categoryId, limit, searchTerm }) {
  await delay(500);
  console.log("MOCK: fetchProducts", { type, categoryId, limit, searchTerm });

  let products = [...mockProducts];

  if (type === 'featured') {
    products = products.filter(p => p.isFeatured);
  }
  if (categoryId) {
    products = products.filter(p => p.categories.some(c => c.id.toString() === categoryId.toString()));
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(term) || p.authors.some(a => a.name.toLowerCase().includes(term)));
  }
  if (limit) {
    return products.slice(0, limit);
  }
  return products;
}

export const fetchProduct = async (id) => {
  await delay(300);
  console.log("MOCK: fetchProduct", { id });
  const product = mockProducts.find(p => p.id.toString() === id.toString());
  if (product) {
    return product;
  }
  throw new Error("Product not found");
};

export const fetchAllProducts = async () => {
  await delay(500);
  console.log("MOCK: fetchAllProducts");
  return [...mockProducts];
}

export const createProductApi = async (payload) => {
  await delay(600);
  console.log("MOCK: createProductApi", payload);
  const newProduct = {
    ...payload,
    id: nextProductId++,
    averageRating: 0,
    ratingCount: 0,
    authors: Array.isArray(payload.authors) ? payload.authors : [{ id: 99, name: payload.authors }],
    categories: Array.isArray(payload.categories) ? payload.categories : [{ id: 99, name: payload.categories }],
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const updateProductApi = async (id, payload) => {
  await delay(400);
  console.log("MOCK: updateProductApi", { id, payload });
  const productIndex = mockProducts.findIndex(p => p.id.toString() === id.toString());
  if (productIndex > -1) {
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...payload };
    return mockProducts[productIndex];
  }
  throw new Error("Product not found");
};

export const deleteProductApi = async (id) => {
  await delay(500);
  console.log("MOCK: deleteProductApi", { id });
  const productIndex = mockProducts.findIndex(p => p.id.toString() === id.toString());
  if (productIndex > -1) {
    mockProducts.splice(productIndex, 1);
    return { success: true, message: "Product deleted" };
  }
  throw new Error("Product not found");
};

export const reduceStockApi = async (productId, newStockQuantity) => {
  await delay(100);
  console.log(`MOCK: reduceStockApi for product ${productId} to ${newStockQuantity}`);
  const product = mockProducts.find(p => p.id === productId);
  if (product) {
    product.stockQuantity = newStockQuantity;
    return product;
  }
  throw new Error("Product not found");
};
