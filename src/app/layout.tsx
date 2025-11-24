import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Schoolverse2 - AI学習コーチ基盤",
  description: "AI学習コーチとクレド実践を支える学習プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
