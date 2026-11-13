"use client";

import { useState } from "react";
import Script from "next/script";
import { updateProfile } from "./actions";
import { FormError, FormNotice } from "@/components/AuthCard";

type Fields = { name: string; phone: string; zipcode: string; address1: string; address2: string };

export default function ProfileForm({ email, initial }: { email: string; initial: Fields }) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function openPostcode() {
    if (!window.daum?.Postcode) return;
    new window.daum.Postcode({
      oncomplete: (d) => setForm((f) => ({ ...f, zipcode: d.zonecode, address1: d.roadAddress || d.jibunAddress })),
    }).open();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await updateProfile(form);
    setBusy(false);
    setMsg("error" in res ? { error: res.error } : { ok: "저장했어요." });
  }

  return (
    <>
      <Script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">이메일</label>
          <input className="input bg-beige/40" value={email} readOnly />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">이름</label>
            <input id="name" className="input" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="label" htmlFor="phone">연락처</label>
            <input id="phone" inputMode="tel" className="input" value={form.phone} onChange={set("phone")} />
          </div>
        </div>
        <div>
          <label className="label">기본 배송지</label>
          <div className="flex gap-2">
            <input readOnly placeholder="우편번호" className="input max-w-36 bg-beige/40" value={form.zipcode} onClick={openPostcode} />
            <button type="button" className="btn-outline shrink-0" onClick={openPostcode}>주소 검색</button>
          </div>
          <input readOnly placeholder="기본 주소" className="input mt-2 bg-beige/40" value={form.address1} onClick={openPostcode} />
          <input placeholder="상세 주소" className="input mt-2" value={form.address2} onChange={set("address2")} />
        </div>
        <FormError message={msg.error} />
        <FormNotice message={msg.ok} />
        <button className="btn-primary" disabled={busy}>{busy ? "저장 중…" : "저장"}</button>
      </form>
    </>
  );
}
