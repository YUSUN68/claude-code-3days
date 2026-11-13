"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteProduct, saveProduct } from "../actions";
import { FormError } from "@/components/AuthCard";
import type { Category, GiftTheme, Product } from "@/lib/types";

const BUCKET = "shop-product-images";

export default function ProductForm({
  categories,
  themes,
  product,
  themeIds = [],
}: {
  categories: Category[];
  themes: GiftTheme[];
  product?: Product;
  themeIds?: number[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    category_id: product?.category_id ?? categories[0]?.id ?? 0,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    summary: product?.summary ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    sale_price: product?.sale_price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "0",
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    size_info: product?.size_info ?? "",
    material: product?.material ?? "",
    components: product?.components ?? "",
    highlights: (product?.highlights ?? []).join("\n"), // 한 줄에 특징 하나
    care_info: product?.care_info ?? "",
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [detailImages, setDetailImages] = useState<string[]>(product?.detail_images ?? []);
  const [selectedThemes, setSelectedThemes] = useState<number[]>(themeIds);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // target: 대표 이미지 목록에 넣을지, 상세 사진 목록에 넣을지
  async function upload(files: FileList | null, target: "images" | "detail") {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name}: 5MB 이하 이미지만 올릴 수 있어요.`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) {
        setError(`업로드 실패: ${error.message}`);
        continue;
      }
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }
    (target === "images" ? setImages : setDetailImages)((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await saveProduct({
      id: product?.id,
      category_id: Number(form.category_id),
      name: form.name,
      slug: form.slug,
      summary: form.summary,
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price === "" ? null : Number(form.sale_price),
      stock: Number(form.stock),
      images,
      is_featured: form.is_featured,
      is_active: form.is_active,
      theme_ids: selectedThemes,
      detail_images: detailImages,
      highlights: form.highlights.split("\n"),
      size_info: form.size_info,
      material: form.material,
      components: form.components,
      care_info: form.care_info,
    });
    setBusy(false);
    if ("error" in res) return setError(res.error ?? "저장하지 못했어요.");
    router.push("/admin/products");
    router.refresh();
  }

  async function onDelete() {
    if (!product || !confirm(`'${product.name}' 상품을 삭제할까요? 되돌릴 수 없어요.\n판매만 멈추려면 '판매 노출'을 끄세요.`)) return;
    const res = await deleteProduct(product.id);
    if ("error" in res) return setError(res.error ?? "삭제하지 못했어요.");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-4xl gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">상품명</label>
            <input id="name" required className="input" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="label" htmlFor="slug">상품 주소 (영문)</label>
            <input id="slug" required placeholder="soy-candle-woody" className="input" value={form.slug} onChange={set("slug")} />
          </div>
          <div>
            <label className="label" htmlFor="category">카테고리</label>
            <select id="category" className="input" value={form.category_id} onChange={set("category_id")}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="stock">재고</label>
            <input id="stock" type="number" min={0} required className="input" value={form.stock} onChange={set("stock")} />
          </div>
          <div>
            <label className="label" htmlFor="price">정가 (원)</label>
            <input id="price" type="number" min={0} step={100} required className="input" value={form.price} onChange={set("price")} />
          </div>
          <div>
            <label className="label" htmlFor="sale">할인가 (원, 선택)</label>
            <input id="sale" type="number" min={0} step={100} className="input" value={form.sale_price} onChange={set("sale_price")} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="summary">한 줄 소개</label>
          <input id="summary" maxLength={120} className="input" value={form.summary} onChange={set("summary")} />
        </div>
        <div>
          <label className="label" htmlFor="description">상세 설명</label>
          <textarea id="description" rows={8} className="input py-2" value={form.description} onChange={set("description")} />
        </div>

        {/* 상세페이지 정보: 상세 설명 탭과 "사이즈 · 정보" 탭에 보여요 */}
        <fieldset className="space-y-4 rounded-md border border-line p-4">
          <legend className="px-1 text-sm font-medium">상세페이지 정보</legend>
          <div>
            <label className="label" htmlFor="highlights">이런 점이 좋아요 (한 줄에 하나씩, 3개 추천)</label>
            <textarea id="highlights" rows={3} className="input py-2" value={form.highlights} onChange={set("highlights")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="size_info">사이즈</label>
              <input id="size_info" placeholder="지름 12cm × 높이 18cm" className="input" value={form.size_info} onChange={set("size_info")} />
            </div>
            <div>
              <label className="label" htmlFor="material">소재</label>
              <input id="material" placeholder="세라믹" className="input" value={form.material} onChange={set("material")} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="components">구성</label>
            <input id="components" placeholder="본체 1, 케이블 1" className="input" value={form.components} onChange={set("components")} />
          </div>
          <div>
            <label className="label" htmlFor="care_info">관리 방법 (한 줄에 하나씩)</label>
            <textarea id="care_info" rows={3} className="input py-2" value={form.care_info} onChange={set("care_info")} />
          </div>
        </fieldset>

        <div>
          <p className="label">이미지 (첫 번째가 대표 이미지)</p>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={src + i} className="group relative h-28 w-28 overflow-hidden rounded-md border border-line bg-beige">
                <img src={src} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-brown px-1.5 text-[10px] text-ivory">대표</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/50 p-1 text-white">
                  <button type="button" onClick={() => move(i, -1)} aria-label="앞으로"><ArrowLeft size={14} /></button>
                  <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} aria-label="삭제"><X size={14} /></button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="뒤로"><ArrowRight size={14} /></button>
                </div>
              </div>
            ))}
            <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-brown/50 text-xs text-brown hover:bg-beige">
              <Upload size={18} />
              {uploading ? "업로드 중…" : "이미지 추가"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files, "images")} disabled={uploading} />
            </label>
          </div>
        </div>

        <div>
          <p className="label">상세 사진 (상세 설명 중간에 크게 보여요, 가로 사진 추천)</p>
          <div className="flex flex-wrap gap-3">
            {detailImages.map((src, i) => (
              <div key={src + i} className="relative h-28 w-40 overflow-hidden rounded-md border border-line bg-beige">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setDetailImages((p) => p.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded bg-ink/60 p-0.5 text-white"
                  aria-label="상세 사진 삭제"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="flex h-28 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-brown/50 text-xs text-brown hover:bg-beige">
              <Upload size={18} />
              {uploading ? "업로드 중…" : "상세 사진 추가"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files, "detail")} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="space-y-3 rounded-md border border-line bg-white/70 p-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-brown" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            판매 노출
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-brown" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
            추천 상품 (홈·선물 추천 상단)
          </label>
        </div>
        <div className="rounded-md border border-line bg-white/70 p-5 text-sm">
          <p className="mb-3 font-medium">선물 테마</p>
          <div className="space-y-2">
            {themes.map((t) => (
              <label key={t.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brown"
                  checked={selectedThemes.includes(t.id)}
                  onChange={(e) => setSelectedThemes((s) => (e.target.checked ? [...s, t.id] : s.filter((x) => x !== t.id)))}
                />
                {t.emoji} {t.name}
              </label>
            ))}
          </div>
        </div>
        <FormError message={error} />
        <div className="flex flex-col gap-2">
          <button className="btn-primary" disabled={busy || uploading}>{busy ? "저장 중…" : "저장"}</button>
          <Link href="/admin/products" className="btn-ghost">취소</Link>
          {product && (
            <button type="button" onClick={onDelete} className="mt-4 text-sm text-terracotta hover:underline">
              상품 삭제
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}
