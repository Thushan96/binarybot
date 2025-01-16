import type { Metadata } from "next";
import RootLayoutClient from "./RootLayout";

export const metadata: Metadata = {
  title: "Binary Bot AI",
  description: "AI bot for binary trading",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
