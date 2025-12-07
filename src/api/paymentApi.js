// MOCK IMPLEMENTATION

const mockPayments = [
    { paymentId: 'pay_1', orderId: 101, amount: 229000, status: 'COMPLETED', method: 'COD', createdAt: new Date('2023-10-26T10:00:00Z').toISOString() },
    { paymentId: 'pay_2', orderId: 102, amount: 165000, status: 'PENDING', method: 'COD', createdAt: new Date('2023-10-28T14:30:00Z').toISOString() },
];
let nextPaymentId = 3;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const createPaymentApi = async (payload) => {
  await delay(800);
  console.log("MOCK: createPaymentApi", payload);
  const newPayment = {
      paymentId: `pay_${nextPaymentId++}`,
      orderId: payload.orderId,
      amount: payload.amount,
      status: 'PENDING', // Trạng thái mặc định khi tạo
      method: payload.method,
      createdAt: new Date().toISOString(),
  };
  mockPayments.push(newPayment);
  // Mô phỏng tạo thành công, trả về paymentId và status
  return { paymentId: newPayment.paymentId, status: newPayment.status };
};

export const getPaymentsAdminApi = async (params = {}) => {
  await delay(600);
  console.log("MOCK: getPaymentsAdminApi", { params });
  // Ở ứng dụng thật, bạn sẽ lọc theo params
  return [...mockPayments];
};
