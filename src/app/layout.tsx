import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Access to Success | Evon Aravinda - O/L Commerce Classes",
  description:
    "Master Commerce the Smart Way with Evon Aravinda. O/L Business & Accounting Studies classes, clear concepts, proven teaching methods, past papers and complete digital learning.",
  keywords: [
    "Evon Aravinda",
    "Commerce Education",
    "Access to Success",
    "O/L Commerce",
    "Business & Accounting Studies",
    "Grade 10 Commerce",
    "Grade 11 Commerce",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
