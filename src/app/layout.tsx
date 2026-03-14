import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  variable: "--font-inter",
  src: [
    { path: "../../public/fonts/inter/Inter-100.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/inter/Inter-200.ttf", weight: "200", style: "normal" },
    { path: "../../public/fonts/inter/Inter-300.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/inter/Inter-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/inter/Inter-500.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/inter/Inter-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/inter/Inter-700.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/inter/Inter-800.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/inter/Inter-900.ttf", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Responsyva",
  description: "IA, automação e CRM transformando atendimento em faturamento.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-black text-white/90 selection:bg-brand-green/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
