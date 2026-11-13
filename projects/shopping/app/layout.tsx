import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { getProfile } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/constants";

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} — 마음을 전하는 인테리어 소품 선물`, template: `%s | ${SITE_NAME}` },
  description: "집들이·생일·기념일 선물, 받는 사람과 예산만 고르면 어울리는 무드등·캔들·화병·디퓨저를 추천해 드려요.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfile();
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={`${notoSerif.variable} flex min-h-screen flex-col`}>
        <CartProvider userId={user?.id ?? null}>
          <Header
            user={user ? { email: user.email ?? "", name: profile?.name ?? null } : null}
            isAdmin={profile?.role === "admin"}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
