// app/card/view/[id]/layout.tsx
import "../../../globals.css";

export default function CardViewStandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-gray-100 min-h-screen">{children}</div>;
}
