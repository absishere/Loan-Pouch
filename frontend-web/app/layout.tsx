import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoanPouch - Decentralized Lending Platform",
  description: "Secure peer-to-peer lending without banks. Build trust, borrow smart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts loaded via standard link — required when Babel replaces SWC */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-syne: 'Syne', sans-serif;
            --font-dm-sans: 'DM Sans', sans-serif;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
