import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login?next=/admin");
  if (profile?.role !== "admin") redirect("/");
  return (
    <div className="container-page pt-10">
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-4">
        <h1 className="font-serif text-2xl font-light">관리자</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="hover:text-brown">대시보드</Link>
          <Link href="/admin/products" className="hover:text-brown">상품 관리</Link>
          <Link href="/admin/orders" className="hover:text-brown">주문 관리</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
