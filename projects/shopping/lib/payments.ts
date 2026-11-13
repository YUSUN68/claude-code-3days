import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

const METHOD_LABEL: Record<string, string> = {
  CARD: "카드",
  카드: "카드",
  TRANSFER: "계좌이체",
  계좌이체: "계좌이체",
  EASY_PAY: "간편결제",
  간편결제: "간편결제",
  VIRTUAL_ACCOUNT: "가상계좌",
  가상계좌: "가상계좌",
  MOBILE_PHONE: "휴대폰",
  휴대폰: "휴대폰",
};

type ConfirmResult = { ok: true; order: Order } | { ok: false; message: string };

/**
 * 토스 결제 승인 + 주문 결제완료 처리
 * 1) 내 주문인지, 결제 대기 상태인지, 금액이 일치하는지 서버에서 확인 (금액 위변조 방지)
 * 2) 토스 승인 API 호출
 * 3) service_role 로 주문 상태 변경·재고 차감
 */
export async function confirmPayment(paymentKey: string, orderNo: string, amount: number): Promise<ConfirmResult> {
  const supabase = await createClient();
  const { data: order } = await supabase.from("shop_orders").select("*").eq("order_no", orderNo).maybeSingle<Order>();
  if (!order) return { ok: false, message: "주문을 찾을 수 없어요." };
  if (order.status !== "pending") {
    return order.status === "cancelled" ? { ok: false, message: "취소된 주문이에요." } : { ok: true, order };
  }
  if (order.total_amount !== amount) {
    await supabase.rpc("shop_cancel_pending_order", { p_order_no: orderNo });
    return { ok: false, message: "결제 금액이 주문 금액과 일치하지 않아 결제를 진행하지 않았어요." };
  }

  const auth = `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY!}:`).toString("base64")}`;
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json", "Idempotency-Key": `confirm-${orderNo}` },
    body: JSON.stringify({ paymentKey, orderId: orderNo, amount }),
    cache: "no-store",
  });
  let body = await res.json().catch(() => ({}));
  if (!res.ok && body?.code === "ALREADY_PROCESSED_PAYMENT") {
    // 이미 승인된 결제라면 토스에서 다시 조회해 이 주문·금액의 완료된 결제인지 확인
    const check = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    const payment = await check.json().catch(() => ({}));
    const valid = check.ok && payment?.orderId === orderNo && payment?.totalAmount === amount && payment?.status === "DONE";
    if (!valid) return { ok: false, message: "결제 정보를 확인할 수 없어요." };
    body = payment;
  } else if (!res.ok) {
    await supabase.rpc("shop_cancel_pending_order", { p_order_no: orderNo });
    return { ok: false, message: body?.message ?? "결제 승인에 실패했어요." };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("shop_mark_order_paid", {
    p_order_no: orderNo,
    p_payment_key: paymentKey,
    p_payment_method: METHOD_LABEL[body?.method] ?? body?.method ?? null,
  });
  if (error) {
    console.error("shop_mark_order_paid failed", error);
    return { ok: false, message: "결제는 완료되었지만 주문 처리 중 문제가 생겼어요. 고객센터로 문의해 주세요." };
  }
  const { data: paid } = await supabase.from("shop_orders").select("*").eq("id", order.id).single<Order>();
  return { ok: true, order: paid ?? order };
}
