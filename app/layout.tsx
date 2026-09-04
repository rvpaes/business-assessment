// app/layout.tsx - Layout Raiz Executivo
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Cloud Business Assessment Intelligence | Gemini 3.8 Flash & BigQuery Graph",
  description: "Plataforma executiva de inteligência analítica para assessments de metadados, priorização NC-MAD de Casos de Uso e Property Graph no BigQuery.",
  icons: {
    icon: "https://logos-world.net/wp-content/uploads/2021/02/Google-Cloud-Logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
