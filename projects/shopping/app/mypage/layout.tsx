import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login?next=/mypage");
  return (
    <div className="container-page pt-12">
      <div className="mb-8">
        <h1 className="section-title">마이페이지</h1>
        <p className="mt-1 text-sm text-muted">{profile?.name ? `${profile.name}님, 안녕하세요.` : user.email}</p>
      </div>
      <div className="grid gap-10 md:grid-cols-[180px_1fr]">
        <nav className="flex gap-2 text-sm md:flex-col md:gap-0">
          <Link href="/mypage" className="chip md:rounded-none md:border-0 md:border-b md:bg-transparent md:px-0 md:py-3">주문 내역</Link>
          <Link href="/mypage/profile" className="chip md:rounded-none md:border-0 md:border-b md:bg-transparent md:px-0 md:py-3">내 정보</Link>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
