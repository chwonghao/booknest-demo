// MOCK IMPLEMENTATION

let mockNotifications = [
    { id: 1, message: "Đơn hàng #102 của bạn đã được xác nhận.", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), link: "/profile/orders" },
    { id: 2, message: "Chào mừng bạn đến với BookNest!", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), link: "/" },
    { id: 3, message: "Đơn hàng #101 đã được giao thành công.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), link: "/profile/orders" },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getNotificationsApi = async () => {
  await delay(400);
  console.log("MOCK: getNotificationsApi");
  return [...mockNotifications];
};

export const markAllReadApi = async () => {
  await delay(200);
  console.log("MOCK: markAllReadApi");
  mockNotifications.forEach(n => n.read = true);
  return { success: true };
};

export const sendEmailApi = async (payload) => {
  await delay(1000);
  console.log("MOCK: sendEmailApi", payload);
  // Mô phỏng gửi email thành công
  return { success: true, message: "Email sent successfully." };
};