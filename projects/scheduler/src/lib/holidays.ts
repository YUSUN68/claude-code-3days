import * as all from '@hyunbinseo/holidays-kr/all';

const map = new Map<string, string>();
for (const year of Object.values(all) as unknown as Record<string, readonly string[]>[]) {
  for (const [k, names] of Object.entries(year)) map.set(k, names.join(', '));
}

export function holidayName(key: string): string | undefined {
  return map.get(key);
}

export function allHolidays(): [string, string][] {
  return [...map.entries()];
}
