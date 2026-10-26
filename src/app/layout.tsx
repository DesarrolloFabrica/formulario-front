import type { Metadata } from "next";
import { Fira_Sans, Merriweather } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Formularios — Fábrica de Contenidos",
  description:
    "Plataforma de formularios por rol de la Fábrica de Contenidos (MVP frontend).",
  icons: {
    icon: "/images/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${firaSans.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
