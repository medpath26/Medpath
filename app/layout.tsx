import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedPath AI | Learn with confidence. Care with purpose.",
  description:
    "An AI-powered healthcare career mentor for Medical Assistant and Surgical Technology students."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
