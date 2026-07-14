import api from "./api";

export const getDashboardAnalytics = async (filter = "all", startDate, endDate) => {
    let url = `/manager/dashboard?filter=${filter}`;
    if (filter === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const getActiveOrders = async () => {
    const response = await api.get("/manager/orders/active");
    return response.data;
};

export const getAllOrders = async (filter = "today", startDate, endDate) => {
    let url = `/manager/orders?filter=${filter}`;
    if (filter === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await api.patch(`/manager/orders/${orderId}/status`, { status });
    return response.data;
};

export const getMenuItems = async () => {
    const response = await api.get("/manager/menu-items");
    return response.data;
};

export const createMenuItem = async (formData) => {
    // formData because of image upload
    const response = await api.post("/manager/menu-items", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const getTables = async () => {
    const response = await api.get("/manager/tables");
    return response.data;
};

export const createTable = async (tableData) => {
    const response = await api.post("/manager/tables", tableData);
    return response.data;
};

export const clearTable = async (tableId) => {
    const response = await api.post(`/manager/tables/${tableId}/clear`);
    return response.data;
};

export const deleteTable = async (tableId) => {
    const response = await api.delete(`/manager/tables/${tableId}`);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/manager/profile");
    return response.data;
};

export const updateProfile = async (formData) => {
    const response = await api.put("/manager/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};
