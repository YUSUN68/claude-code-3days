/** 알림 본문: 정시(0) / 몇 분·시간 전 / 시간 지정(null). Edge Function sched-send-reminders와 같은 문구 */
export function reminderText(offset: number | null): string {
  if (offset === 0) return '지금 시작이에요';
  if (offset == null) return '알림 시간이에요';
  return offset >= 60 ? `${offset / 60}시간 후 시작` : `${offset}분 후 시작`;
}
