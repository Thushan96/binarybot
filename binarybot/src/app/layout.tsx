"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./redux/reduxProvider";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "";
  const pathname = usePathname();
  const disableWebSocket = pathname === "/login" || pathname === "/main";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ReduxProvider>
        <WebSocketProvider appId={APP_ID} disableWebSocket={disableWebSocket}>
          {children}
        </WebSocketProvider>
        </ReduxProvider>  
      </body>
    </html>
  );
}
