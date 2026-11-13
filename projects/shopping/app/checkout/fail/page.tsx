import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "결제 실패" };

type SP = Promise<{ code?: string; message?: string; orderNo?: string; orderId?: string }>;

export default async function CheckoutFailPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const orderNo = sp.orderNo ?? sp.orderId;
  if (orderNo) {
    const supabase = await createClient();
    await supabase.rpc("shop_cancel_pending_order", { p_order_no: orderNo });
  }
  const userCancelled = sp.code === "PAY_PROCESS_CANCELED" || sp.code === "USER_CANCEL";

  return (
    <div className="container-page py-32 text-center">
      <h1 className="section-title">{userCancelled ? "결제를 취소했어요" : "결제에 실패했어요"}</h1>
      <p className="mt-3 text-sm text-muted">
        {sp.message ?? "결제가 완료되지 않았어요. 다시 시도해 주세요."}
      </p>
      {sp.code && !userCancelled && <p className="mt-1 text-xs text-muted">오류 코드: {sp.code}</p>}
      <div className="mt-8 flex justify-center gap-2">
        <Link href="/cart" className="btn-primary px-8">장바구니로 돌아가기</Link>
        <Link href="/" className="btn-outline px-8">홈으로</Link>
      </div>
    </div>
  );
}
