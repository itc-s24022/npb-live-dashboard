import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import TeamSelectorModal from "@/components/TeamSelectorModal";
import YearSelectorModal from "@/components/YearSelectorModal";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "NPB Live Dashboard - プロ野球試合情報",
  description: "プロ野球の試合結果、順位表、スケジュールを一目で確認できるダッシュボード",
  keywords: ["プロ野球", "NPB", "試合結果", "順位表", "スケジュール"],
  authors: [{ name: "NPB Live Dashboard" }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          <main className="pt-14 pb-16 min-h-screen max-w-screen-lg mx-auto bg-light-bg dark:bg-dark-bg">
            {children}
          </main>
          <BottomNavigation />
          <TeamSelectorModal />
          <YearSelectorModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
