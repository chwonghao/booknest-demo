// MOCK IMPLEMENTATION
const mockUsers = [
    {
        id: 1,
        fullName: "Người Dùng Demo",
        email: "user@example.com",
        password: "password123",
        role: "USER",
        status: "ACTIVE",
        avatar: "https://i.pravatar.cc/150?u=user@example.com",
        phoneNumber: "0123456789",
        address: "123 Đường ABC, Quận 1, TP. HCM"
    },
    {
        id: 2,
        fullName: "Quản Trị Viên",
        password: "password123",
        email: "admin@example.com",
        role: "ADMIN",
        status: "ACTIVE",
        avatar: "https://i.pravatar.cc/150?u=admin@example.com",
        phoneNumber: "0987654321",
        address: "456 Đường XYZ, Quận 3, TP. HCM"
    },
    {
        id: 3,
        fullName: "Tài Khoản Bị Khóa",
        email: "banned@example.com",
        password: "password123",
        role: "USER",
        status: "BANNED",
        avatar: "https://i.pravatar.cc/150?u=banned@example.com",
        phoneNumber: "0111222333",
        address: "789 Đường DEF, Quận 5, TP. HCM"
    }
];
let nextUserId = 4;

const createMockToken = (user, expiresInMinutes = 15) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ 
        sub: user.email, 
        role: user.role, 
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (expiresInMinutes * 60)
    }));
    const signature = "mock-signature";
    return `${header}.${payload}.${signature}`;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const simulateApiError = (message, status = 400) => {
    const error = new Error(message);
    error.response = { data: { message }, status };
    return error;
};

export const loginApi = async ({ email, password }) => {
    await delay(500);
    console.log("MOCK: loginApi", { email, password });
    const user = mockUsers.find(u => u.email === email);

    if (user && password === "password123") { // Mật khẩu test: "password"
        const accessToken = createMockToken(user, 15);
        const refreshToken = `refresh-for-${user.email}`;
        return { accessToken, refreshToken };
    }
    throw simulateApiError("Email hoặc mật khẩu không đúng.", 401);
};

export const registerApi = async (userData) => {
    await delay(700);
    console.log("MOCK: registerApi", userData);
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
        throw simulateApiError("Email đã tồn tại.");
    }
    const newUser = {
        id: nextUserId++,
        ...userData,
        role: 'USER',
        status: 'ACTIVE',
        avatar: `https://i.pravatar.cc/150?u=${userData.email}`
    };
    mockUsers.push(newUser);
    return { success: true, message: "Đăng ký thành công!" };
};

export const profileApi = async (userEmail, token) => {
    await delay(200);
    console.log("MOCK: profileApi for email:", userEmail);
    const user = mockUsers.find(u => u.email === userEmail);
    if (user) {
        return user;
    }
    throw simulateApiError("User profile not found", 404);
};

export const updateProfileApi = async (userId, payload) => {
    await delay(400);
    console.log("MOCK: updateProfileApi", { userId, payload });
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...payload };
        return mockUsers[userIndex];
    }
    throw simulateApiError("User not found", 404);
};

export const refreshTokenApi = async (refreshToken) => {
    await delay(300);
    console.log("MOCK: refreshTokenApi");
    if (refreshToken && refreshToken.startsWith('refresh-for-')) {
        const email = refreshToken.replace('refresh-for-', '');
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            const newAccessToken = createMockToken(user, 15);
            return { accessToken: newAccessToken };
        }
    }
    throw simulateApiError("Invalid refresh token", 401);
};
