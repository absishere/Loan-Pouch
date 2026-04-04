import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loan Pouch - Decentralized Lending Platform",
  description: "Secure peer-to-peer lending without banks. Build trust, borrow smart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
