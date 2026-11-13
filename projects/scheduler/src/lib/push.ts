import { supabase } from './supabase';

const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export type PushState = 'on' | 'off' | 'denied' | 'unsupported';

function supported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!VAPID && !window.desktop;
}

function b64ToBytes(b64: string) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || window.desktop) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    /* 서비스워커를 못 쓰는 환경은 알림 없이 동작 */
  }
}

async function saveSubscription(sub: PushSubscription) {
  const j = sub.toJSON();
  await supabase
    .from('sched_push_subscriptions')
    .upsert({ endpoint: sub.endpoint, p256dh: j.keys!.p256dh, auth: j.keys!.auth }, { onConflict: 'endpoint' });
}

export async function pushState(): Promise<PushState> {
  if (!supported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub && Notification.permission === 'granted') {
    saveSubscription(sub).catch(() => undefined);
    return 'on';
  }
  return 'off';
}

export async function enablePush(): Promise<PushState> {
  if (!supported()) return 'unsupported';
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return perm === 'denied' ? 'denied' : 'off';
  const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'));
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID!) }));
  await saveSubscription(sub);
  return 'on';
}
