import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/lib/toast";
import NotificationProvider from "@/components/NotificationProvider";

export const metadata: Metadata = {
    title: "inVision U — Talent Command Center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
            <body>
                <ThemeProvider>
                    <ToastProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
