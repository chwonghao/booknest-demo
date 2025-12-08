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

    if (user && user.password === password) {
        if (user.status === 'BANNED') {
            throw simulateApiError("Tài khoản này đã bị khóa.", 403);
        }
        // Trả về thông tin người dùng, loại bỏ mật khẩu
        const { password, ...userProfile } = user;
        return userProfile;
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

export const profileApi = async () => {
    await delay(200);
    // Thay vì dùng token, ta đọc trực tiếp email của người dùng từ localStorage
    // (Giả định rằng AuthContext sẽ lưu 'userEmail' sau khi đăng nhập thành công)
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        return null; // Không có người dùng nào đang đăng nhập
    }

    console.log("MOCK: profileApi for email from localStorage:", userEmail);
    const user = mockUsers.find(u => u.email === userEmail);

    if (user) {
        const { password, ...userProfile } = user;
        return userProfile;
    }
    throw simulateApiError("Không tìm thấy hồ sơ người dùng.", 404);
};

export const updateProfileApi = async (userId, payload) => {
    await delay(400);
    console.log("MOCK: updateProfileApi for userId:", userId, "with payload:", payload);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...payload };
        const { password, ...userProfile } = mockUsers[userIndex];
        return userProfile;
    }
    throw simulateApiError("User not found", 404);
};
