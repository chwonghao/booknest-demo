// MOCK IMPLEMENTATION
import { getAllOrdersApi } from './orderApi'; // Sử dụng orders đã được mock

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMockSummary = async () => {
    const allOrders = await getAllOrdersApi();
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = allOrders.length;
    const totalUsers = 3; // Từ mockUsers
    return {
        totalRevenue,
        totalOrders,
        totalUsers,
        newOrders: allOrders.filter(o => o.status === 'PENDING').length,
    };
};

const getMockWeeklySales = () => {
    return [
        { name: 'Mon', sales: 400000 },
        { name: 'Tue', sales: 300000 },
        { name: 'Wed', sales: 200000 },
        { name: 'Thu', sales: 278000 },
        { name: 'Fri', sales: 189000 },
        { name: 'Sat', sales: 239000 },
        { name: 'Sun', sales: 349000 },
    ];
};

const getMockRecentOrders = async (limit = 5) => {
    const allOrders = await getAllOrdersApi();
    return allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, limit);
};

// Mock cho endpoint tổng hợp
export const getDashboardDataApi = async () => {
    await delay(800);
    console.log("MOCK: getDashboardDataApi");
    const summary = await getMockSummary();
    const weeklySales = getMockWeeklySales();
    const recentOrders = await getMockRecentOrders(5);
    return {
        data: {
            summary,
            weeklySales,
            recentOrders,
        }
    };
};

// Mock cho các endpoint riêng lẻ
export const getDashboardSummaryApi = async () => {
    await delay(400);
    console.log("MOCK: getDashboardSummaryApi");
    const summary = await getMockSummary();
    return { data: summary };
};

export const getWeeklySalesApi = async () => {
    await delay(300);
    console.log("MOCK: getWeeklySalesApi");
    return { data: getMockWeeklySales() };
};

export const getRecentOrdersApi = async (limit = 5) => {
    await delay(500);
    console.log("MOCK: getRecentOrdersApi");
    const recentOrders = await getMockRecentOrders(limit);
    return { data: recentOrders };
};