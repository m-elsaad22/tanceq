import type { Metadata } from "next";
import { Cairo, Reem_Kufi } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const reemKufi = Reem_Kufi({
  variable: "--font-brand",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ركن التطور | إدارة المواقع حسب الدولة",
  description:
    "لوحة مركزية لإدارة كل تثبيتات ووردبريس لركن التطور في كل دولة والتنقل بينها بسهولة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${reemKufi.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
