import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Control Horario MVP",
    description: "Sistema de control de asistencia laboral",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className}>
                {children}
                <Toaster
                    position="top-right"
                    richColors
                    expand={false}
                    duration={3000}
                />
            </body>
        </html>
    );
}