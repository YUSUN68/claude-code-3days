"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { safeNext } from "@/lib/format";
import { FormError } from "@/components/AuthCard";

export default function SignupForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) return setError("비밀번호는 8자 이상이어야 해요.");
    if (form.password !== form.confirm) return setError("비밀번호 확인이 일치하지 않아요.");
    if (!agree) return setError("이용약관과 개인정보 수집·이용에 동의해 주세요.");

    setBusy(true);
    const supabase = createClient();
    const email = form.email.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: { name: form.name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) return setError(authErrorMessage(error));
    // 이미 가입된 이메일이면 identities 가 비어 있음
    if (data.user && data.user.identities?.length === 0) {
      return setError(authErrorMessage({ code: "user_already_exists" }));
    }
    if (data.session) {
      window.location.assign(next); // 이메일 인증이 꺼져 있으면 바로 로그인됨
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="space-y-4 text-center text-sm">
        <p className="text-2xl" aria-hidden>✉️</p>
        <p>
          <b>{sentTo}</b> 으로 인증 메일을 보냈어요.
          <br />
          메일의 링크를 누르면 가입이 완료됩니다.
        </p>
        <p className="text-xs text-muted">메일이 보이지 않으면 스팸함을 확인해 주세요.</p>
        <Link href="/login" className="btn-outline w-full">로그인 화면으로</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">이름</label>
        <input id="name" required className="input" autoComplete="name" value={form.name} onChange={set("name")} />
      </div>
      <div>
        <label className="label" htmlFor="email">이메일</label>
        <input id="email" type="email" required className="input" autoComplete="email" value={form.email} onChange={set("email")} />
      </div>
      <div>
        <label className="label" htmlFor="password">비밀번호</label>
        <input id="password" type="password" required minLength={8} className="input" autoComplete="new-password" placeholder="8자 이상" value={form.password} onChange={set("password")} />
      </div>
      <div>
        <label className="label" htmlFor="confirm">비밀번호 확인</label>
        <input id="confirm" type="password" required className="input" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1 accent-brown" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>[필수] 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
      </label>
      <FormError message={error} />
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "가입 중…" : "가입하기"}
      </button>
      <p className="pt-2 text-center text-sm text-muted">
        이미 회원이신가요?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-brown hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
