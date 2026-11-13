"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthCard, { FormError, FormNotice } from "@/components/AuthCard";

const RESEND_SECONDS = 60;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (cooldown > 0) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    // 가입 여부를 노출하지 않도록, 전송 제한 외의 오류도 동일하게 "보냈어요"로 안내
    if (error && (error.status === 429 || error.code === "over_email_send_rate_limit")) {
      setError("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setSent(true);
    setCooldown(RESEND_SECONDS);
  }

  return (
    <AuthCard title="비밀번호 찾기" subtitle="가입한 이메일로 비밀번호 재설정 링크를 보내 드려요">
      <form onSubmit={send} className="space-y-4">
        {sent && (
          <FormNotice message="입력하신 이메일이 가입되어 있다면 재설정 링크를 보냈어요. 메일함(스팸함 포함)을 확인해 주세요." />
        )}
        <div>
          <label className="label" htmlFor="email">이메일</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <FormError message={error} />
        <button className="btn-primary w-full" disabled={busy || cooldown > 0}>
          {busy ? "보내는 중…" : cooldown > 0 ? `다시 보내기 (${cooldown}초)` : sent ? "다시 보내기" : "재설정 링크 받기"}
        </button>
        <p className="pt-2 text-center text-sm">
          <Link href="/login" className="text-muted hover:text-brown">로그인으로 돌아가기</Link>
        </p>
      </form>
    </AuthCard>
  );
}
