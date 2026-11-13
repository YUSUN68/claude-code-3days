"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { safeNext } from "@/lib/format";
import { FormError, FormNotice } from "@/components/AuthCard";

export default function LoginForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") === "callback" ? "인증 링크가 만료되었거나 올바르지 않아요. 다시 시도해 주세요." : null
  );
  const [busy, setBusy] = useState(false);
  const notice =
    params.get("message") === "password-updated" ? "비밀번호가 변경되었어요. 새 비밀번호로 로그인해 주세요." : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(authErrorMessage(error));
      setBusy(false);
      return;
    }
    // 서버 컴포넌트(헤더 등)가 새 세션을 읽도록 전체 이동
    window.location.assign(next);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormNotice message={notice} />
      <div>
        <label className="label" htmlFor="email">이메일</label>
        <input id="email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="password">비밀번호</label>
        <input id="password" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <FormError message={error} />
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "로그인 중…" : "로그인"}
      </button>
      <div className="flex justify-between pt-2 text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-brown">
          비밀번호를 잊으셨나요?
        </Link>
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-medium text-brown hover:underline">
          회원가입
        </Link>
      </div>
    </form>
  );
}
