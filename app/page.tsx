"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        { username: email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { access_token } = res.data;
      Cookies.set("auth_token", access_token, { expires: 7 });
      window.location.href = "/create-card";
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid credentials");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0F] relative overflow-hidden text-white">
      {/* Subtle starfield dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>

      {/* Card */}
      <div className="w-full max-w-md relative z-10 bg-[#111318]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/10">
        {/* Logo */}
        {/* <div className="flex justify-center mb-6">
          <Image
            src="/next.svg"
            alt="App Logo"
            width={64}
            height={64}
            className="rounded-xl"
            priority
          />
        </div> */}

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-1">
          Welcome to MEGA RAIL
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Sign in to continue to{" "}
          <span className="font-medium text-gray-200">Card Generator</span>
        </p>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center mb-4">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <div className="flex items-center bg-[#1A1C23] rounded-lg px-4 py-3 border border-white/10 focus-within:border-purple-500 transition">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <div className="flex items-center bg-[#1A1C23] rounded-lg px-4 py-3 border border-white/10 focus-within:border-purple-500 transition">
              <Lock className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-blue-600 hover:to-purple-600 font-semibold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
