import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Línea decorativa superior */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400" />

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Logo + título */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-md shadow-brand-200">
                <Activity className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-bold text-brand-600">Clínica Ángeles de Leo's</h1>
              <p className="mt-1 text-sm font-semibold text-slate-800">Iniciar sesión</p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ejemplo@clinicaangeles.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Iniciar sesión
              </Button>

              <p className="text-center text-sm">
                <button
                  type="button"
                  className="font-medium text-brand-600 hover:underline"
                  onClick={() =>
                    setError('Contacta a tu administrador para restablecer tu contraseña.')
                  }
                >
                  ¿Olvidó su contraseña?
                </button>
              </p>
            </form>

            <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
              © Sistema Clínica Ángeles de Leo's
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-700">Políticas de Privacidad</a>
            <a href="#" className="hover:text-slate-700">Términos de Uso</a>
          </div>
          <p className="mt-2 text-center text-[11px] uppercase tracking-wide text-slate-400">
            © 2026 Sistema de Gestión Clínica Ángeles de Leo's
          </p>
        </div>
      </div>
    </div>
  );
}
