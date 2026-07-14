import api from "./api";

export const getMenu = async (hotelId) => {
    const response = await api.get(`/public/${hotelId}/menu`);
    return response.data;
};

export const placeOrder = async (hotelId, orderData) => {
    const response = await api.post(`/public/${hotelId}/order`, orderData);
    return response.data;
};

export const getOrderStatus = async (hotelId, orderId) => {
    const response = await api.get(`/public/${hotelId}/order/${orderId}`);
    return response.data;
};

export const callWaiter = async (hotelId, tableId) => {
    const response = await api.post(`/public/${hotelId}/table/${tableId}/call-waiter`);
    return response.data;
};

export const requestBill = async (hotelId, tableId) => {
    const response = await api.post(`/public/${hotelId}/table/${tableId}/request-bill`);
    return response.data;
};
