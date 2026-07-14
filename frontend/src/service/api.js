import axios from "axios";

const api = axios.create({
    baseURL: "https://omnibite.onrender.com/api/v1",
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response
);

export default api;