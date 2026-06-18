import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportMind - Customer Feedback Portal",
  description: "AI-Powered Customer Feedback Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
