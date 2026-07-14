import axios from "axios";

const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        // Use the same hostname as the frontend to prevent cross-origin cookie issues
        return `http://${window.location.hostname}:8000/api/v1`;
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response
    // (error) => {
    //   if (error.response && error.response.status === 401) {
    //     Alert.alert(
    //       "Session Expired",
    //       "Your session has expired. Please log in again.",
    //       [
    //         {
    //           text: "OK",
    //           onPress: () => {
    //             resetRoot(); // Navigate to GetStarted
    //           },
    //         },
    //       ]
    //     );
    //   }
    //   return Promise.reject(error);
    // }
);

export default api;
