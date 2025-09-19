"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("auth_token"); // remove token
    router.push("/login"); // redirect to login page
  };

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-gray-800">
          Employee cards generator
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
