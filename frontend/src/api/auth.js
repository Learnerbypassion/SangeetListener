import api from "./axiosInstance";

export const registerUser = ({ username, email, password, role }) =>
    api.post("/api/auth/register", { username, email, password, role });

export const loginUser = ({ username, email, password }) =>
    api.post("/api/auth/login", { username, email, password });

export const logoutUser = () =>
    api.post("/api/auth/logout");

export const verifyUser = () =>
    api.get("/api/auth/verify");

export const verifyOtp = ({ email, otp }) =>
    api.post("/api/auth/verify-otp", { email, otp });
