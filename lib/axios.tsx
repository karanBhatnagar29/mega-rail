// lib/axios.ts
"use client";

import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // redirect to unauthorized page
      if (typeof window !== "undefined") {
        window.location.href = "/unauthorized";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
