import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarPlus, AlertCircle, Info, XCircle, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Combobox } from '@/components/ui/Combobox';
import { ESTADO_CITA_LABELS } from '@/lib/format';
import type { Appointment, EstadoCita, Paciente, MedicoBasic } from '@/types/domain';

export function AppointmentFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<MedicoBasic[]>([]);
  const [pacienteId, setPacienteId] = useState<string | null>(null);
  const [medicoId, setMedicoId] = useState<string | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [estado, setEstado] = useState<EstadoCita>('PENDIENTE');
  const [motivo, setMotivo] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [pacientesData, medicosData, appointment] = await Promise.all([
          api.get<Paciente[]>('/pacientes'),
          api.get<MedicoBasic[]>('/medicos'),
          id ? api.get<Appointment>(`/appointments/${id}`) : Promise.resolve(null),
        ]);
        setPacientes(pacientesData);
        setMedicos(medicosData);

        if (appointment) {
          const d = new Date(appointment.fechaHora);
          setPacienteId(appointment.pacienteId);
          setMedicoId(appointment.medicoId);
          setFecha(d.toISOString().slice(0, 10));
          setHora(d.toTimeString().slice(0, 5));
          setEstado(appointment.estado);
          setMotivo(appointment.motivo ?? '');
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar la información');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pacienteId || !medicoId || !fecha || !hora) {
      setError('Completa paciente, médico, fecha y hora antes de guardar');
      return;
    }

    const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString();

    setIsSaving(true);
    try {
      const payload = { pacienteId, medicoId, fechaHora, estado, motivo: motivo || undefined };
      if (isEditMode) {
        await api.patch(`/appointments/${id}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      navigate('/citas');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la cita');
    } finally {
      setIsSaving(false);
    }
  }

  const pacienteOptions = pacientes.map((p) => ({
    value: p.id,
    label: p.nombreCompleto,
    description: `${p.edad} años · ${p.genero}`,
  }));

  const medicoOptions = medicos.map((m) => ({
    value: m.id,
    label: `Dr(a). ${m.user.nombre} ${m.user.apellido}`,
    description: m.especialidad,
  }));

  if (isLoading) {
    return <p className="text-slate-400">Cargando…</p>;
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <CalendarPlus className="h-5 w-5 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? 'Editar cita' : 'Registrar cita'}
        </h1>
      </div>
      <p className="mb-6 max-w-xl text-sm text-slate-500">
        Complete los siguientes campos para agendar una atención médica en el sistema.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <h2 className="font-semibold text-slate-900">Información del paciente</h2>
              <div className="mt-3">
                <Field label="Paciente" required>
                  <Combobox
                    options={pacienteOptions}
                    value={pacienteId}
                    onChange={setPacienteId}
                    placeholder="Busca un paciente por nombre…"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="font-semibold text-slate-900">Detalles médicos</h2>
              <div className="mt-3">
                <Field label="Médico tratante" required>
                  <Combobox
                    options={medicoOptions}
                    value={medicoId}
                    onChange={setMedicoId}
                    placeholder="Busca un médico por nombre o especialidad…"
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <Field label="Fecha de la cita" required>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </Field>
              <Field label="Hora" required>
                <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <Field label="Estado inicial" required>
                <Select value={estado} onChange={(e) => setEstado(e.target.value as EstadoCita)}>
                  {(Object.keys(ESTADO_CITA_LABELS) as EstadoCita[]).map((e) => (
                    <option key={e} value={e}>
                      {ESTADO_CITA_LABELS[e]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="mt-4">
                <Field label="Motivo / Descripción de la cita">
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    placeholder="Describa brevemente el motivo de la consulta o síntomas reportados…"
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <Button type="button" variant="destructive" onClick={() => navigate('/citas')}>
                <XCircle className="h-4 w-4" /> Cancelar registro
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <CheckCircle2 className="h-4 w-4" /> Guardar cita
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="font-medium text-slate-800">Horarios disponibles</p>
                <p className="text-slate-500">Lunes a Viernes: 08:00 AM - 08:00 PM</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="font-medium text-slate-800">Políticas de cancelación</p>
                <p className="text-slate-500">Mínimo 24 horas antes de la sesión.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
