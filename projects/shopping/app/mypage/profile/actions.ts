"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(input: { name: string; phone: string; zipcode: string; address1: string; address2: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const { error } = await supabase
    .from("shop_profiles")
    .update({
      name: input.name.trim() || null,
      phone: input.phone.replace(/[^0-9]/g, "") || null,
      zipcode: input.zipcode.trim() || null,
      address1: input.address1.trim() || null,
      address2: input.address2.trim() || null,
    })
    .eq("id", user.id);
  if (error) return { error: "저장하지 못했어요. 다시 시도해 주세요." };
  revalidatePath("/", "layout");
  return { ok: true };
}
