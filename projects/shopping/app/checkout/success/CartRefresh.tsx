"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

// 결제 완료 후 서버에서 비워진 장바구니를 헤더 배지에 반영
export default function CartRefresh() {
  const { reload } = useCart();
  useEffect(() => {
    reload();
  }, [reload]);
  return null;
}
