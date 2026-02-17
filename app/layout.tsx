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
    <html lang="ja" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('npb-live-storage');if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.settings&&p.state.settings.theme==='dark'){document.documentElement.className='dark'}}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        style={{ backgroundColor: '#f5f5f5', color: '#1a1d29' }}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('npb-live-storage');if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.settings&&p.state.settings.theme==='dark'){document.body.style.backgroundColor='#1a1d29';document.body.style.color='white'}}}catch(e){}})();`,
          }}
        />
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
