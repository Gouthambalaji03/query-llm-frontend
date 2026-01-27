import axios from "axios";
import { getFirebaseAuth } from "./firebase";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "success" in response.data) {
      if (response.data.success) {
        return response;
      } else {
        return Promise.reject(new Error(response.data.error?.message || "An error occurred"));
      }
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const auth = getFirebaseAuth();
      auth.signOut();
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
