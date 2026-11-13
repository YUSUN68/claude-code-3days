"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "../../actions";
import type { OrderStatus } from "@/lib/types";

const ACTIONS: Partial<Record<OrderStatus, { to: OrderStatus; label: string; danger?: boolean }[]>> = {
  paid: [
    { to: "shipping", label: "배송 시작" },
    { to: "cancelled", label: "주문 취소", danger: true },
  ],
  shipping: [{ to: "delivered", label: "배송 완료" }],
};

export default function StatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const actions = ACTIONS[status];
  if (!actions) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 rounded-md bg-beige/60 p-4">
      <span className="mr-2 text-sm text-muted">상태 변경</span>
      {actions.map((a) => (
        <button
          key={a.to}
          disabled={pending}
          className={a.danger ? "btn border border-terracotta text-terracotta hover:bg-terracotta hover:text-white" : "btn-primary"}
          onClick={() => {
            if (a.danger && !confirm("주문을 취소할까요? (테스트 결제는 토스 개발자센터에서 별도로 취소해야 합니다)")) return;
            start(async () => {
              const res = await updateOrderStatus(orderId, a.to);
              setError("error" in res ? res.error ?? null : null);
            });
          }}
        >
          {a.label}
        </button>
      ))}
      {error && <span className="text-sm text-terracotta">{error}</span>}
    </div>
  );
}
