import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ title, onClose, children }: { title: ReactNode; onClose(): void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const doc = ref.current?.ownerDocument ?? document;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    doc.addEventListener('keydown', onKey);
    const first = ref.current?.querySelector<HTMLElement>('input, select, textarea, button');
    first?.focus();
    return () => doc.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" ref={ref}>
        <div className="px-box">
          <div className="modal-head">
            <h2>{title}</h2>
            <button className="btn ghost small" onClick={onClose} aria-label="닫기">
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
