import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/types/auth';

function initials(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

export function Topbar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold leading-tight text-slate-900">
            {user.nombre} {user.apellido}
          </p>
          <p className="text-xs leading-tight text-slate-500">{ROLE_LABELS[user.role]}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {initials(user.nombre, user.apellido)}
        </div>
      </div>
    </header>
  );
}
