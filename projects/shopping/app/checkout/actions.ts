"use server";

import { createClient } from "@/lib/supabase/server";

export type ShippingInput = {
  recipient: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
  memo: string;
  saveAsDefault: boolean;
};

export async function createOrder(items: { product_id: number; quantity: number }[], shipping: ShippingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const phone = shipping.phone.replace(/[^0-9]/g, "");
  if (!/^01[0-9]{8,9}$/.test(phone) && !/^0[2-9][0-9]{7,9}$/.test(phone)) {
    return { error: "연락처를 정확히 입력해 주세요." };
  }

  const { data, error } = await supabase.rpc("shop_create_order", {
    p_items: items,
    p_recipient: shipping.recipient.trim(),
    p_phone: phone,
    p_zipcode: shipping.zipcode.trim(),
    p_address1: shipping.address1.trim(),
    p_address2: shipping.address2.trim() || null,
    p_memo: shipping.memo.trim() || null,
  });
  if (error || !data?.[0]) {
    return { error: error?.message ?? "주문을 만들지 못했어요. 다시 시도해 주세요." };
  }

  if (shipping.saveAsDefault) {
    await supabase
      .from("shop_profiles")
      .update({
        phone,
        zipcode: shipping.zipcode.trim(),
        address1: shipping.address1.trim(),
        address2: shipping.address2.trim() || null,
      })
      .eq("id", user.id);
  }

  const order = data[0] as { order_no: string; order_name: string; total_amount: number };
  return { orderNo: order.order_no, orderName: order.order_name, amount: order.total_amount };
}

export async function cancelPendingOrder(orderNo: string) {
  const supabase = await createClient();
  await supabase.rpc("shop_cancel_pending_order", { p_order_no: orderNo });
}
