import api from "./api";

export const getAllManagers = async () => {
    const response = await api.get("/superadmin/managers");
    return response.data;
};

export const toggleBlockManager = async (managerId) => {
    const response = await api.patch(`/superadmin/managers/${managerId}/toggle-block`);
    return response.data;
};

export const getPlatformAnalytics = async () => {
    const response = await api.get("/superadmin/analytics");
    return response.data;
};
