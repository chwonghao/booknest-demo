// MOCK IMPLEMENTATION

// Dữ liệu này nên đồng bộ với authApi.js
const mockUsers = [
    {
        id: 1,
        fullName: "Người Dùng Demo",
        email: "user@example.com",
        role: "USER",
        status: "ACTIVE",
        avatar: "https://i.pravatar.cc/150?u=user@example.com",
        phoneNumber: "0123456789",
        address: "123 Đường ABC, Quận 1, TP. HCM"
    },
    {
        id: 2,
        fullName: "Quản Trị Viên",
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
        role: "USER",
        status: "BANNED",
        avatar: "https://i.pravatar.cc/150?u=banned@example.com",
        phoneNumber: "0111222333",
        address: "789 Đường DEF, Quận 5, TP. HCM"
    }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllUserApi = async () => {
  await delay(500);
  console.log("MOCK: getAllUserApi");
  return [...mockUsers];
};

export const updateUserApi = async (userId, payload) => {
  await delay(400);
  console.log("MOCK: updateUserApi", { userId, payload });
  const userIndex = mockUsers.findIndex(u => u.id.toString() === userId.toString());
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...payload };
    return mockUsers[userIndex];
  }
  throw new Error("User not found");
};