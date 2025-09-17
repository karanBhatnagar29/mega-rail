// RootLayout.tsx
import "./globals.css";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-50">
        {/* Sidebar always on left */}
        <Sidebar />

        {/* Main section grows beside sidebar */}
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
