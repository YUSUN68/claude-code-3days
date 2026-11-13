export type QuickAddResult = { mode: 'instant'; title: string } | { mode: 'form'; title: string } | null;

/**
 * '-'로 시작하면 다른 항목 없이 '기타' 카테고리로 바로 등록하고,
 * 아니면 제목이 채워진 등록 폼을 연다.
 */
export function parseQuickAdd(raw: string): QuickAddResult {
  const text = raw.trim();
  if (!text) return null;
  if (text.startsWith('-')) {
    const title = text.slice(1).trim();
    return title ? { mode: 'instant', title } : null;
  }
  return { mode: 'form', title: text };
}
