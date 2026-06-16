import axios from "axios";
import { useLoader } from ".";

export default function useApiPrivate() {
    if (!process.env.REACT_APP_SERVER_BASE_URL) throw new Error("Expected an error object to be thrown.");

    const { showLoader, hideLoader } = useLoader();
    const apiManager = axios.create({
        baseURL: `${process.env.REACT_APP_SERVER_BASE_URL}api`,
        withCredentials: true,
    });

    apiManager.interceptors.request.use(
        (config) => {
            if (config.method !== "get" || config.url.includes("/user/")) {
                showLoader();
            }
            return config;
        },
        (err) => Promise.reject(err),
    );

    apiManager.interceptors.response.use(
        (response) => {
            hideLoader();
            return response;
        },
        (error) => {
            hideLoader();
            // 401 — session expired or not authenticated, redirect to login
            if (error?.response?.status === 401) {
                window.location.href = "/authenticate";
                return Promise.reject(error);
            }
            // 500 — log it so it surfaces in the console
            if (error?.response?.status >= 500) {
                console.error("[API 500]", error?.response?.data || error.message);
            }
            return Promise.reject(error);
        },
    );

    const getCars = async (params) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const res = await apiManager.get(`/cars?${queryParams}`);
            return res.data.data;
        } catch (err) {
            return [];
        }
    };

    const getUserInfo = async () => {
        try {
            const res = await apiManager.get(`/user/`);
            return res.data;
        } catch (err) {
            return [];
        }
    };

    const newBooking = async (bookingData) => {
        try {
            const res = await apiManager.post(`/cars/newBooking/`, bookingData);
            return res.data;
        } catch (err) {
            return { message: "Unable to book at the moment!", next: "" };
        }
    };

    const confirmBooking = async (success) => {
        try {
            const res = await apiManager.post(`/cars/confirmBooking/`, { success });
            return res.data;
        } catch (err) {
            return { message: "Unable to confirm booking!", next: "home" };
        }
    };

    const retryBooking = async (id) => {
        try {
            const res = await apiManager.put(`/cars/${id}`);
            return res.data;
        } catch (err) {
            return { message: "Unable to retry booking!", next: "" };
        }
    };

    const cancelBooking = async (id) => {
        try {
            const res = await apiManager.delete(`/cars/${id}`);
            return res.data;
        } catch (err) {
            return { message: "Unable to cancel booking!", next: "home" };
        }
    };

    const updateUser = async (data) => {
        try {
            console.table(data);
            const res = await apiManager.post(`/user/update`, { updateData: data });
            return res.data;
        } catch (err) {
            return { message: "Unable to update user!", next: "" };
        }
    };

    return { getCars, getUserInfo, newBooking, retryBooking, confirmBooking, cancelBooking, updateUser };
}
