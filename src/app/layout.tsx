// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// ★ 追加：AppLayout をインポート
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Schoolverse2",
  description: "AI学習コーチのための基盤",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* ここで AppLayout で children をラップする */}
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
