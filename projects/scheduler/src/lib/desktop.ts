/** Electron(윈도우 프로그램)에서 preload가 넣어주는 브리지. 웹 브라우저에서는 undefined */
export interface DesktopBridge {
  isDesktop: true;
  openMain(path: string): void;
  toggleWidget(): void;
  getSettings(): Promise<{ widgetOnTop: boolean; openAtLogin: boolean }>;
  setSetting(key: 'widgetOnTop' | 'openAtLogin', value: boolean): Promise<void>;
  onNavigate(cb: (path: string) => void): () => void;
  closeWidget(): void;
}

declare global {
  interface Window {
    desktop?: DesktopBridge;
  }
}

export const desktop: DesktopBridge | undefined = typeof window !== 'undefined' ? window.desktop : undefined;
export const isDesktop = !!desktop;
