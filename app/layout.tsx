import "./globals.css";

export const metadata = {
  title: "QuantEdge - Dashboard",
  description: "Terminal de Inteligencia Deportiva",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900">{children}</body>
    </html>
  );
}