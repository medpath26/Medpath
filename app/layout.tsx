import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedPath | Learn. Practice. Pass.",
  description:
    "A MedPath healthcare career mentor for Medical Assistant and Surgical Technology students.",
  icons: {
    icon: [{ url: "/medpath-favicon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/medpath-favicon.png",
    apple: "/medpath-favicon.png"
  }
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
