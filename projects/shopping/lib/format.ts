export function won(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function discountRate(price: number, sale: number | null) {
  if (sale == null || sale >= price) return 0;
  return Math.round(((price - sale) / price) * 100);
}

export function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

// 로그인 후 이동할 경로: 같은 사이트 내부 경로만 허용 (오픈 리다이렉트 방지)
export function safeNext(next: string | null | undefined, fallback = "/") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
