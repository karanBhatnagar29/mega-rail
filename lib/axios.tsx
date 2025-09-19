// lib/axios.ts
"use client";

import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  console.log("🔑 Token from cookie:", token);
  console.log("📤 Request URL:", config.url);
  console.log("📤 Request Headers before:", config.headers);

  if (token) {
    // ✅ Use set() to avoid TS issues with AxiosHeaders
    if (config.headers) {
      (config.headers as any).set?.("Authorization", `Bearer ${token}`) ||
        ((config.headers as any)["Authorization"] = `Bearer ${token}`);
    }
  }

  console.log("📤 Request Headers after:", config.headers);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/unauthorized";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
