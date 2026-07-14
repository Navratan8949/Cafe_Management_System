import api from "./api";

export const login = async (email, password) => {
    try {
        const response = await api.post("/auth/login", { email, password });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const createManager = async (userData) => {
    try {
        const response = await api.post("/auth/create-manager", userData);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const register = async (userData) => {
    try {
        const response = await api.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}