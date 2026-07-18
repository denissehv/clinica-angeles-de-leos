import { Construction } from 'lucide-react';

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <Construction className="h-7 w-7" />
      </div>
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Esta pantalla todavía está en construcción. La iremos armando en las próximas iteraciones.
      </p>
    </div>
  );
}
