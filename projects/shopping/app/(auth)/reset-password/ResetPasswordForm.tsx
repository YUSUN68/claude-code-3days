"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { FormError, FormNotice } from "@/components/AuthCard";

export default function ResetPasswordForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("비밀번호는 8자 이상이어야 해요.");
    if (password !== confirm) return setError("비밀번호 확인이 일치하지 않아요.");
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(authErrorMessage(error));
    setDone(true);
    setTimeout(() => window.location.assign(redirectTo), 1500);
  }

  if (done) return <FormNotice message="비밀번호가 변경되었어요. 잠시 후 이동합니다…" />;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="new-password">새 비밀번호</label>
        <input id="new-password" type="password" required minLength={8} autoComplete="new-password" placeholder="8자 이상" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="new-password-confirm">새 비밀번호 확인</label>
        <input id="new-password-confirm" type="password" required autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <FormError message={error} />
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "변경 중…" : "비밀번호 변경"}
      </button>
    </form>
  );
}
