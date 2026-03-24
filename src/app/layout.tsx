import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArbiLoop - ポケカ裁定価格比較",
  description:
    "日本の免税価格と海外相場を瞬時に比較。ポケカBOXの利益をシミュレーション。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen antialiased">
        <header className="border-b border-[var(--border)] px-4 py-3">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-[var(--accent-gold)]">Arbi</span>Loop
            </h1>
            <span className="text-xs text-[var(--text-secondary)]">
              v0.1.0
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-2xl p-4">{children}</main>
      </body>
    </html>
  );
}
