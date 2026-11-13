"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Gift, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { SITE_NAME } from "@/lib/constants";
import { signOut } from "@/app/(auth)/actions";

const NAV = [
  { href: "/products", label: "전체" },
  { href: "/products?category=mood-lamp", label: "무드등" },
  { href: "/products?category=candle", label: "캔들" },
  { href: "/products?category=vase", label: "화병" },
  { href: "/products?category=diffuser", label: "디퓨저" },
  { href: "/products?category=objet", label: "오브제" },
  { href: "/products?category=fabric", label: "패브릭" },
];

type Props = { user: { email: string; name: string | null } | null; isAdmin: boolean };

export default function Header({ user, isAdmin }: Props) {
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawer(false);
    setSearchOpen(false);
  }, [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/products?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-ivory/85 backdrop-blur-md" : "border-transparent bg-ivory"
      }`}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <button
          className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label="메뉴 열기"
          onClick={() => setDrawer(true)}
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>

        <Link href="/" className="whitespace-nowrap font-serif text-xl tracking-wide">
          {SITE_NAME}
        </Link>

        <nav className="ml-8 hidden items-center gap-6 text-sm lg:flex">
          <Link
            href="/gift"
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-medium transition-colors ${
              pathname === "/gift" ? "bg-brown text-ivory" : "bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-ivory"
            }`}
          >
            <Gift size={16} strokeWidth={1.75} /> 선물 추천
          </Link>
          <span className="h-4 w-px bg-line" aria-hidden />
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-ink/80 transition-colors hover:text-brown">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center">
          <Link
            href="/gift"
            className="flex h-11 items-center gap-1 px-2 text-sm font-medium text-terracotta lg:hidden"
            aria-label="선물 추천"
          >
            <Gift size={20} strokeWidth={1.5} />
            <span className="hidden sm:inline">선물 추천</span>
          </Link>
          <button
            className="flex h-11 w-11 items-center justify-center"
            aria-label="검색"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          {isAdmin && (
            <Link href="/admin" className="hidden px-2 text-sm text-brown hover:underline sm:block">
              관리자
            </Link>
          )}
          {user ? (
            <div className="group relative">
              <Link href="/mypage" className="flex h-11 w-11 items-center justify-center" aria-label="마이페이지">
                <User size={20} strokeWidth={1.5} />
              </Link>
              <div className="invisible absolute right-0 top-full w-44 rounded-md border border-line bg-white py-2 text-sm opacity-0 shadow-sm transition-opacity group-hover:visible group-hover:opacity-100">
                <p className="truncate px-4 pb-2 text-xs text-muted">{user.name || user.email}</p>
                <Link href="/mypage" className="block px-4 py-2 hover:bg-beige">주문 내역</Link>
                <Link href="/mypage/profile" className="block px-4 py-2 hover:bg-beige">내 정보</Link>
                <form action={signOut}>
                  <button className="w-full px-4 py-2 text-left hover:bg-beige">로그아웃</button>
                </form>
              </div>
            </div>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="px-2 text-sm hover:text-brown">
              로그인
            </Link>
          )}
          <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center" aria-label="장바구니">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute right-1 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-ivory">
          <form onSubmit={submitSearch} className="container-page flex gap-2 py-3">
            <input
              autoFocus
              className="input"
              placeholder="상품명을 입력하세요 (예: 캔들, 무드등)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn-primary shrink-0">검색</button>
          </form>
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-ivory p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-lg">{SITE_NAME}</span>
              <button aria-label="메뉴 닫기" className="flex h-11 w-11 items-center justify-center" onClick={() => setDrawer(false)}>
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <Link href="/gift" className="mb-4 flex items-center gap-2 font-medium text-terracotta">
              <Gift size={18} strokeWidth={1.5} /> 선물 추천
            </Link>
            <nav className="flex flex-col">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="border-b border-line py-3">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 text-sm">
              {user ? (
                <>
                  <Link href="/mypage" className="py-2">마이페이지</Link>
                  {isAdmin && <Link href="/admin" className="py-2 text-brown">관리자</Link>}
                  <form action={signOut}>
                    <button className="py-2">로그아웃</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-primary">로그인</Link>
                  <Link href="/signup" className="btn-outline">회원가입</Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
