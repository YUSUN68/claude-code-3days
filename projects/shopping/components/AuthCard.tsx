export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center font-serif text-3xl font-light">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>}
        <div className="mt-8 rounded-md border border-line bg-white/70 p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="rounded-md bg-terracotta/10 px-3 py-2 text-sm text-terracotta" role="alert">{message}</p>;
}

export function FormNotice({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="rounded-md bg-beige px-3 py-2 text-sm text-ink" role="status">{message}</p>;
}
