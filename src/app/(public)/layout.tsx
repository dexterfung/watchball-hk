import type { Metadata } from "next";
import { OfflineBanner } from "@/components/schedule/OfflineBanner";
import { ThemeToggle } from "@/components/schedule/ThemeToggle";

export const metadata: Metadata = {
  title: "香港足球電視直播時間表 | WatchBall HK",
  description: "香港足球電視及OTT平台直播時間表，每日更新賽程、頻道及開賽時間。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WatchBall HK",
  },
  icons: {
    apple: "/icons/icon-192x192.svg",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OfflineBanner />
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-blue-800 dark:text-blue-300">
            ⚽ 香港足球電視直播時間表
          </h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
    </>
  );
}
