import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  FileText,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  formatTime,
  formatCurrency,
  isSameDay,
  ESTADO_CITA_LABELS,
  ESTADO_CITA_VARIANTS,
} from '@/lib/format';
import type { Paciente, Appointment, Prescription, Finance } from '@/types/domain';

interface DashboardData {
  pacientes: Paciente[] | null;
  appointments: Appointment[] | null;
  prescriptions: Prescription[] | null;
  finances: Finance[] | null;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    pacientes: null,
    appointments: null,
    prescriptions: null,
    finances: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canSeePacientes = user && ['ADMIN', 'MEDICO', 'RECEPCION'].includes(user.role);
  const canSeeCitas = user && ['ADMIN', 'MEDICO', 'RECEPCION'].includes(user.role);
  const canSeeRecetas = user && ['ADMIN', 'MEDICO'].includes(user.role);
  const canSeeFinanzas = user && ['ADMIN', 'RECEPCION'].includes(user.role);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [pacientes, appointments, prescriptions, finances] = await Promise.all([
          canSeePacientes ? api.get<Paciente[]>('/pacientes') : Promise.resolve(null),
          canSeeCitas ? api.get<Appointment[]>('/appointments') : Promise.resolve(null),
          canSeeRecetas ? api.get<Prescription[]>('/prescriptions') : Promise.resolve(null),
          canSeeFinanzas ? api.get<Finance[]>('/finances') : Promise.resolve(null),
        ]);
        if (!cancelled) {
          setData({ pacientes, appointments, prescriptions, finances });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los datos del panel');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (!user) return null;

  // --- Vista simplificada para Pacientes: hoy en día el backend no expone
  // un endpoint "mi expediente" para el propio paciente, así que en vez de
  // inventar datos mostramos un panel de bienvenida honesto. ---
  if (user.role === 'PACIENTE') {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Hola, {user.nombre} 👋</h1>
        <p className="mt-1 text-slate-500">
          Bienvenido al portal de Clínica Ángeles de Leo's.
        </p>
        <Card className="mt-6 p-6">
          <p className="text-sm text-slate-600">
            Desde aquí podrás consultar tu expediente clínico y tus recetas médicas en cuanto tu
            médico te comparta el número de expediente. Esta sección se ampliará próximamente para
            mostrar tu información automáticamente.
          </p>
        </Card>
      </div>
    );
  }

  const citasHoy = data.appointments?.filter((a) => isSameDay(a.fechaHora)) ?? [];
  const proximasCitas = (data.appointments ?? [])
    .filter((a) => new Date(a.fechaHora).getTime() >= Date.now() - 1000 * 60 * 60)
    .slice(0, 5);

  const ingresosHoy = (data.finances ?? [])
    .filter((f) => f.tipo === 'INGRESO' && isSameDay(f.fecha))
    .reduce((sum, f) => sum + parseFloat(f.monto), 0);

  const citasPendientes = (data.appointments ?? []).filter((a) => a.estado === 'PENDIENTE').length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de control</h1>
          <p className="text-slate-500">
            Bienvenido de nuevo, {user.nombre}. Aquí tienes el resumen de hoy.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">
          {error}
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canSeePacientes && (
          <StatCard
            icon={Users}
            label="Pacientes registrados"
            value={data.pacientes?.length ?? 0}
            accent="brand"
            isLoading={isLoading}
          />
        )}
        {canSeeCitas && (
          <StatCard
            icon={CalendarDays}
            label="Citas hoy"
            value={citasHoy.length}
            accent="success"
            isLoading={isLoading}
          />
        )}
        {canSeeRecetas && (
          <StatCard
            icon={FileText}
            label="Recetas emitidas"
            value={data.prescriptions?.length ?? 0}
            accent="brand"
            isLoading={isLoading}
          />
        )}
        {canSeeFinanzas ? (
          <StatCard
            icon={Wallet}
            label="Ingresos de hoy"
            value={formatCurrency(ingresosHoy)}
            accent="warning"
            isLoading={isLoading}
          />
        ) : (
          canSeeCitas && (
            <StatCard
              icon={CalendarDays}
              label="Citas pendientes"
              value={citasPendientes}
              accent="warning"
              isLoading={isLoading}
            />
          )
        )}
      </div>

      {/* Próximas citas */}
      {canSeeCitas && (
        <Card className="mt-6">
          <div className="flex items-center justify-between p-5 pb-0">
            <div>
              <h2 className="font-semibold text-slate-900">Próximas citas</h2>
              <p className="text-sm text-slate-500">Siguientes consultas programadas.</p>
            </div>
            <Link
              to="/citas"
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-t border-slate-100 text-slate-500">
                  <th className="px-5 py-2 font-medium">Hora</th>
                  <th className="px-5 py-2 font-medium">Paciente</th>
                  <th className="px-5 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-slate-400">
                      Cargando citas…
                    </td>
                  </tr>
                ) : proximasCitas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-slate-400">
                      No hay citas próximas registradas.
                    </td>
                  </tr>
                ) : (
                  proximasCitas.map((cita) => (
                    <tr key={cita.id} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {formatTime(cita.fechaHora)}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {cita.paciente?.nombreCompleto ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={ESTADO_CITA_VARIANTS[cita.estado]}>
                          {ESTADO_CITA_LABELS[cita.estado]}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
