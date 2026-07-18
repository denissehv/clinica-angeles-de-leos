import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Search,
  UserRound,
  Plus,
  Check,
  X,
  Pencil,
  Clock,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  formatDate,
  formatTime,
  isSameDay,
  ESTADO_CITA_LABELS,
  ESTADO_CITA_VARIANTS,
} from '@/lib/format';
import type { Appointment, EstadoCita } from '@/types/domain';

const PAGE_SIZE = 8;

export function AppointmentsListPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoCita | 'TODOS'>('TODOS');
  const [page, setPage] = useState(1);
  const [toCancel, setToCancel] = useState<Appointment | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Appointment[]>('/appointments');
      setAppointments(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las citas');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const citasHoy = appointments.filter((a) => isSameDay(a.fechaHora));
  const confirmadas = citasHoy.filter((a) => a.estado === 'CONFIRMADA');
  const proxima = appointments
    .filter((a) => a.estado !== 'CANCELADA' && new Date(a.fechaHora).getTime() >= Date.now())
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())[0];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesSearch =
        !term ||
        a.paciente?.nombreCompleto.toLowerCase().includes(term) ||
        `${a.medico?.user.nombre} ${a.medico?.user.apellido}`.toLowerCase().includes(term) ||
        (a.motivo ?? '').toLowerCase().includes(term);
      const matchesEstado = estadoFilter === 'TODOS' || a.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [appointments, search, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function updateEstado(appointment: Appointment, estado: EstadoCita) {
    setIsMutating(true);
    try {
      const updated = await api.patch<Appointment>(`/appointments/${appointment.id}`, { estado });
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la cita');
    } finally {
      setIsMutating(false);
    }
  }

  async function handleCancel() {
    if (!toCancel) return;
    await updateEstado(toCancel, 'CANCELADA');
    setToCancel(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de citas</h1>
          <p className="text-slate-500">Monitorea y organiza las consultas en tiempo real.</p>
        </div>
        <Button onClick={() => navigate('/citas/nueva')}>
          <Plus className="h-4 w-4" /> Registrar cita
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Citas hoy" value={citasHoy.length} accent="brand" isLoading={isLoading} />
        <StatCard
          icon={CheckCircle2}
          label="Confirmadas (hoy)"
          value={confirmadas.length}
          accent="success"
          isLoading={isLoading}
        />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-brand-600">
            <Clock className="h-3.5 w-3.5" /> Próxima cita
          </div>
          {isLoading ? (
            <div className="mt-3 h-10 animate-pulse rounded bg-slate-200" />
          ) : proxima ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{proxima.paciente?.nombreCompleto}</p>
                <p className="text-xs text-slate-500">
                  Dr(a). {proxima.medico?.user.nombre} {proxima.medico?.user.apellido} · {formatTime(proxima.fechaHora)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No hay próximas citas.</p>
          )}
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar por paciente, médico o motivo..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-slate-500">Estado:</span>
            <Select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value as EstadoCita | 'TODOS');
                setPage(1);
              }}
              className="w-44"
            >
              <option value="TODOS">Todos</option>
              {(Object.keys(ESTADO_CITA_LABELS) as EstadoCita[]).map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_CITA_LABELS[estado]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Médico</th>
                <th className="px-5 py-3 font-medium">Fecha / Hora</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Cargando citas…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No se encontraron citas con esos filtros.
                  </td>
                </tr>
              ) : (
                paged.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {a.paciente?.nombreCompleto ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Dr(a). {a.medico?.user.nombre} {a.medico?.user.apellido}
                      <span className="ml-1 text-xs text-slate-400">({a.medico?.especialidad})</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(a.fechaHora)} · {formatTime(a.fechaHora)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={ESTADO_CITA_VARIANTS[a.estado]}>{ESTADO_CITA_LABELS[a.estado]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {a.estado !== 'CONFIRMADA' && a.estado !== 'CANCELADA' && (
                          <button
                            onClick={() => updateEstado(a, 'CONFIRMADA')}
                            disabled={isMutating}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-success-text hover:bg-success-bg disabled:opacity-40"
                            title="Confirmar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {a.estado !== 'CANCELADA' && (
                          <button
                            onClick={() => setToCancel(a)}
                            disabled={isMutating}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-danger-text hover:bg-danger-bg disabled:opacity-40"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/citas/${a.id}/editar`)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 py-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        open={!!toCancel}
        title="¿Cancelar esta cita?"
        description={`La cita de ${toCancel?.paciente?.nombreCompleto} quedará marcada como cancelada.`}
        confirmLabel="Sí, cancelar"
        isLoading={isMutating}
        onConfirm={handleCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}
