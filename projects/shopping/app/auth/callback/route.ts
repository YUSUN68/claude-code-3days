import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/format";

// 이메일 인증·비밀번호 재설정 링크가 돌아오는 곳: 토큰을 세션으로 바꾼 뒤 next 로 이동
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  if (ok) return NextResponse.redirect(`${origin}${type === "recovery" ? "/reset-password" : next}`);
  // 재설정 링크가 만료된 경우 만료 안내 화면으로, 그 외는 로그인 화면으로
  if (next === "/reset-password" || type === "recovery") return NextResponse.redirect(`${origin}/reset-password`);
  return NextResponse.redirect(`${origin}/login?error=callback`);
}
