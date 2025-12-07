// MOCK IMPLEMENTATION
import { fetchProduct, reduceStockApi } from "./productApi"; // Sử dụng các phiên bản đã mock

let mockOrders = [
    {
        id: 101,
        userId: 1,
        orderDate: new Date('2023-10-26T10:00:00Z').toISOString(),
        status: "DELIVERED",
        totalAmount: 229000,
        shippingAddress: { fullName: 'Người Dùng Demo', address: '123 Đường ABC, Quận 1, TP. HCM', phoneNumber: '0123456789' },
        orderItems: [
            { productId: 1, name: "Lược Sử Loài Người", quantity: 1, price: 150000 },
            { productId: 2, name: "Nhà Giả Kim", quantity: 1, price: 79000 },
        ]
    },
    {
        id: 102,
        userId: 1,
        orderDate: new Date('2023-10-28T14:30:00Z').toISOString(),
        status: "PENDING",
        totalAmount: 165000,
        shippingAddress: { fullName: 'Người Dùng Demo', address: '123 Đường ABC, Quận 1, TP. HCM', phoneNumber: '0123456789' },
        orderItems: [
            { productId: 4, name: "Sapiens: Lược Sử Tương Lai", quantity: 1, price: 165000 },
        ]
    }
];
let nextOrderId = 103;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const createOrderApi = async (payload) => {
    await delay(1000);
    console.log("MOCK: createOrderApi", payload);

    // Mô phỏng logic từ file gốc
    try {
        for (const item of payload.orderItems) {
            const product = await fetchProduct(item.productId);
            await reduceStockApi(item.productId, product.stockQuantity - item.quantity);
        }
    } catch (error) {
        console.error("MOCK: Lỗi trừ kho khi tạo đơn hàng", error);
        throw new Error("Không thể cập nhật kho, đơn hàng chưa được tạo.");
    }

    const newOrder = {
        id: nextOrderId++,
        userId: payload.userId,
        orderDate: new Date().toISOString(),
        status: "PENDING",
        totalAmount: payload.totalAmount,
        orderItems: payload.orderItems,
        shippingAddress: payload.shippingAddress,
    };
    mockOrders.push(newOrder);

    // File gốc trả về toàn bộ object response, ta mô phỏng điều đó
    return { data: newOrder };
};

export const getMyOrdersApi = async (userId, params = {}) => {
    await delay(500);
    console.log(`MOCK: getMyOrdersApi for user ${userId}`, { params });
    return mockOrders.filter(o => o.userId.toString() === userId.toString());
};

export const getAllOrdersApi = async () => {
    await delay(500);
    console.log("MOCK: getAllOrdersApi");
    return [...mockOrders];
};

export const updateOrderStatusApi = async (orderId, status) => {
    await delay(300);
    console.log(`MOCK: updateOrderStatusApi for order ${orderId} to status ${status}`);
    const order = mockOrders.find(o => o.id.toString() === orderId.toString());
    if (order) {
        order.status = status;
        return order;
    }
    throw new Error("Order not found");
};