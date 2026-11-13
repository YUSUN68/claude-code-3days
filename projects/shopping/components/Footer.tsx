import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-beige/60">
      <div className="container-page grid gap-8 py-12 text-sm text-muted sm:grid-cols-3">
        <div>
          <p className="mb-2 font-serif text-lg text-ink">{SITE_NAME}</p>
          <p>마음을 전하는 인테리어 소품 선물</p>
        </div>
        <div>
          <p className="mb-2 font-medium text-ink">고객센터</p>
          <p>평일 10:00 – 17:00 (점심 12:30 – 13:30)</p>
          <p>주말·공휴일 휴무</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="mb-1 font-medium text-ink">안내</p>
          <Link href="/products" className="hover:text-brown">전체 상품</Link>
          <Link href="/gift" className="hover:text-brown">선물 추천</Link>
          <span>배송비 3,000원 · 5만원 이상 무료배송</span>
        </div>
      </div>
      <div className="container-page border-t border-line py-6 text-xs text-muted">
        <p>상호명: (등록 예정) · 대표: (등록 예정) · 사업자등록번호: (등록 예정)</p>
        <p className="mt-1">© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
