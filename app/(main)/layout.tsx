// app/(main)/layout.tsx
import "../globals.css";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* Sidebar fixed on the left */}
        <Sidebar className="fixed left-0 top-0 h-screen" />

        {/* Main section with margin so it doesn’t overlap */}
        <div className="ml-64 flex flex-col min-h-screen transition-all duration-300">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
