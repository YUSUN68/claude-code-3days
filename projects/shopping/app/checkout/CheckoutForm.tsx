"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { createOrder } from "./actions";
import { won } from "@/lib/format";
import { shippingFeeFor } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { FormError } from "@/components/AuthCard";

export type CheckoutLine = { product: Product; quantity: number };

type Defaults = { recipient: string; phone: string; zipcode: string; address1: string; address2: string };

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: {
        oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string; buildingName: string }) => void;
      }) => { open: () => void };
    };
  }
}

const MEMO_PRESETS = ["문 앞에 놓아주세요", "경비실에 맡겨주세요", "배송 전 연락 바랍니다", "선물 포장 부탁드려요"];

export default function CheckoutForm({
  lines,
  customerKey,
  email,
  defaults,
}: {
  lines: CheckoutLine[];
  customerKey: string;
  email: string;
  defaults: Defaults;
}) {
  const itemsAmount = lines.reduce((s, l) => s + l.product.final_price * l.quantity, 0);
  const shipping = shippingFeeFor(itemsAmount);
  const total = itemsAmount + shipping;

  const [form, setForm] = useState({ ...defaults, memo: "", saveAsDefault: !defaults.address1 });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const addr2Ref = useRef<HTMLInputElement>(null);

  // 토스페이먼츠 결제위젯 렌더링
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
        const widgets = toss.widgets({ customerKey });
        await widgets.setAmount({ currency: "KRW", value: total });
        if (cancelled) return;
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        widgetsRef.current = widgets;
        if (!cancelled) setWidgetReady(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("결제 모듈을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // 결제위젯은 한 번만 렌더링 (금액은 결제 직전에 서버 금액으로 다시 설정)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof Defaults | "memo") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function openPostcode() {
    if (!window.daum?.Postcode) {
      setError("주소 검색을 불러오는 중이에요. 잠시 후 다시 눌러 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const extra = data.buildingName ? ` (${data.buildingName})` : "";
        setForm((f) => ({ ...f, zipcode: data.zonecode, address1: (data.roadAddress || data.jibunAddress) + extra }));
        setTimeout(() => addr2Ref.current?.focus(), 0);
      },
    }).open();
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.zipcode || !form.address1) return setError("주소 검색으로 배송지를 입력해 주세요.");
    const widgets = widgetsRef.current;
    if (!widgets) return setError("결제 모듈을 준비 중이에요. 잠시만 기다려 주세요.");

    setBusy(true);
    const res = await createOrder(
      lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      { ...form }
    );
    if ("error" in res) {
      setBusy(false);
      return setError(res.error ?? "주문을 만들지 못했어요.");
    }
    try {
      // 금액은 서버(DB)가 계산한 값으로 결제
      await widgets.setAmount({ currency: "KRW", value: res.amount });
      await widgets.requestPayment({
        orderId: res.orderNo,
        orderName: res.orderName,
        customerEmail: email || undefined,
        customerName: form.recipient,
        customerMobilePhone: form.phone.replace(/[^0-9]/g, ""),
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail?orderNo=${encodeURIComponent(res.orderNo)}`,
      });
    } catch (err) {
      // 사용자가 결제창을 닫은 경우 등
      const message = err instanceof Error ? err.message : "결제가 취소되었어요.";
      window.location.assign(`/checkout/fail?orderNo=${encodeURIComponent(res.orderNo)}&message=${encodeURIComponent(message)}`);
    }
  }

  return (
    <>
      <Script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <form onSubmit={pay} className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 border-b border-ink pb-3 font-medium">주문 상품 ({lines.length})</h2>
            <ul className="divide-y divide-line">
              {lines.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-beige">
                    {product.images[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate">{product.name}</p>
                    <p className="text-muted">{won(product.final_price)} · {quantity}개</p>
                  </div>
                  <p className="text-sm font-semibold">{won(product.final_price * quantity)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 border-b border-ink pb-3 font-medium">배송 정보</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="recipient">받는 분</label>
                <input id="recipient" required className="input" value={form.recipient} onChange={set("recipient")} />
              </div>
              <div>
                <label className="label" htmlFor="phone">연락처</label>
                <input id="phone" required inputMode="tel" placeholder="010-0000-0000" className="input" value={form.phone} onChange={set("phone")} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="zipcode">주소</label>
                <div className="flex gap-2">
                  <input id="zipcode" readOnly required placeholder="우편번호" className="input max-w-36 bg-beige/40" value={form.zipcode} onClick={openPostcode} />
                  <button type="button" className="btn-outline shrink-0" onClick={openPostcode}>주소 검색</button>
                </div>
                <input readOnly required placeholder="기본 주소" className="input mt-2 bg-beige/40" value={form.address1} onClick={openPostcode} aria-label="기본 주소" />
                <input ref={addr2Ref} placeholder="상세 주소 (동·호수)" className="input mt-2" value={form.address2} onChange={set("address2")} aria-label="상세 주소" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="memo">배송 메모</label>
                <input id="memo" list="memo-presets" maxLength={100} placeholder="선택 또는 직접 입력" className="input" value={form.memo} onChange={set("memo")} />
                <datalist id="memo-presets">
                  {MEMO_PRESETS.map((m) => <option key={m} value={m} />)}
                </datalist>
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" className="h-4 w-4 accent-brown" checked={form.saveAsDefault} onChange={(e) => setForm((f) => ({ ...f, saveAsDefault: e.target.checked }))} />
                기본 배송지로 저장
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-4 border-b border-ink pb-3 font-medium">결제 수단</h2>
            <p className="mb-3 rounded-md bg-beige px-3 py-2 text-xs text-muted">
              테스트 모드입니다. 실제로 결제되지 않아요.
            </p>
            <div id="payment-method" />
            <div id="agreement" />
          </section>
        </div>

        <aside className="h-fit rounded-md border border-line bg-white/70 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-medium">결제 금액</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">상품 금액</dt><dd>{won(itemsAmount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">배송비</dt><dd>{shipping === 0 ? "무료" : won(shipping)}</dd></div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span>총 결제 금액</span>
            <span className="text-xl font-semibold text-brown">{won(total)}</span>
          </div>
          <div className="mt-4"><FormError message={error} /></div>
          <button className="btn-primary mt-4 w-full" disabled={busy || !widgetReady}>
            {busy ? "결제 진행 중…" : !widgetReady ? "결제 준비 중…" : `${won(total)} 결제하기`}
          </button>
        </aside>
      </form>
    </>
  );
}
