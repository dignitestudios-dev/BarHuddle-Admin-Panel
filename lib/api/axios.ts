import axios from "axios";

export const baseURL = "https://api.dev.barhuddle.com/admin";

const headers = {
  "Content-Type": "application/json",
};
const formDataHeaders = {
  "Content-Type": "multipart/form-data",
};

// Create an Axios instance
export const API = axios.create({
  baseURL: baseURL,
  timeout: 10000, // Set a timeout (optional)
  headers: headers,
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from storage
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("authToken"); // Remove token if unauthorized
      window.location.href = "/auth/login"; // Redirect to login page
    }
    console.log(error);
    console.log("API Error:", error.response?.data || error);
    return Promise.reject(error);
  }
);
