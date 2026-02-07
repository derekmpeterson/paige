import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paige — Spoiler-Free Book Chat",
  description:
    "Chat about your books without spoilers. Upload an epub, set your progress, and discuss freely.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
