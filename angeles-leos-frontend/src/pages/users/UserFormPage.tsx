import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, AlertCircle, ShieldAlert, Info, XCircle, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Role } from '@/types/auth';
import { ROLE_LABELS } from '@/types/auth';
import type { UserAccount } from '@/types/domain';

interface FormState {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  role: Role;
  telefono: string;
  activo: boolean;
  password: string;
  confirmPassword: string;
  cedulaProfesional: string;
  especialidad: string;
  fechaNacimiento: string;
  genero: string;
  tipoSanguineo: string;
}

const EMPTY_FORM: FormState = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  role: 'PACIENTE',
  telefono: '',
  activo: true,
  password: '',
  confirmPassword: '',
  cedulaProfesional: '',
  especialidad: '',
  fechaNacimiento: '',
  genero: '',
  tipoSanguineo: '',
};

export function UserFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isLoadingUser, setIsLoadingUser] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<UserAccount>(`/users/${id}`)
      .then((u) => {
        const [apellidoPaterno = '', apellidoMaterno = ''] = u.apellido.split(/\s+(.+)/);
        setForm({
          ...EMPTY_FORM,
          nombre: u.nombre,
          apellidoPaterno,
          apellidoMaterno,
          email: u.email,
          role: u.role,
          telefono: u.telefono ?? '',
          activo: u.activo,
          cedulaProfesional: u.medicoPerfil?.cedulaProfesional ?? '',
          especialidad: u.medicoPerfil?.especialidad ?? '',
          fechaNacimiento: u.pacientePerfil?.fechaNacimiento?.slice(0, 10) ?? '',
          genero: u.pacientePerfil?.genero ?? '',
          tipoSanguineo: u.pacientePerfil?.tipoSanguineo ?? '',
        });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el usuario'))
      .finally(() => setIsLoadingUser(false));
  }, [id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password || !isEditMode) {
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (!isEditMode && form.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno,
        email: form.email,
        role: form.role,
        telefono: form.telefono || undefined,
        activo: form.activo,
      };
      if (form.password) payload.password = form.password;

      if (form.role === 'MEDICO') {
        payload.cedulaProfesional = form.cedulaProfesional;
        payload.especialidad = form.especialidad || undefined;
      }
      if (form.role === 'PACIENTE') {
        payload.fechaNacimiento = form.fechaNacimiento;
        payload.genero = form.genero;
        payload.tipoSanguineo = form.tipoSanguineo || undefined;
      }

      if (isEditMode) {
        await api.patch(`/users/${id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      navigate('/usuarios');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el usuario');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingUser) {
    return <p className="text-slate-400">Cargando usuario…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? 'Editar usuario' : 'Registrar usuario'}
        </h1>
      </div>
      <p className="mb-6 -mt-4 max-w-xl text-sm text-slate-500">
        {isEditMode
          ? 'Actualice la información y los permisos de esta cuenta.'
          : 'Cree una nueva credencial de acceso para el personal administrativo, médico o para un paciente.'}
      </p>

      <Card className="mx-auto max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h2 className="font-semibold text-slate-900">Información del perfil</h2>
            <p className="text-sm text-slate-500">Complete todos los campos obligatorios.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre(s)" required>
              <Input value={form.nombre} onChange={(e) => update('nombre', e.target.value)} required />
            </Field>
            <Field label="Apellido paterno" required>
              <Input
                value={form.apellidoPaterno}
                onChange={(e) => update('apellidoPaterno', e.target.value)}
                required
              />
            </Field>
            <Field label="Apellido materno" required>
              <Input
                value={form.apellidoMaterno}
                onChange={(e) => update('apellidoMaterno', e.target.value)}
                required
              />
            </Field>
            <Field label="Tipo de rol" required>
              <Select value={form.role} onChange={(e) => update('role', e.target.value as Role)}>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Correo electrónico" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </Field>

          {/* Campos dinámicos según el rol */}
          {form.role === 'MEDICO' && (
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <Field label="Cédula profesional" required>
                <Input
                  value={form.cedulaProfesional}
                  onChange={(e) => update('cedulaProfesional', e.target.value)}
                  required
                />
              </Field>
              <Field label="Especialidad">
                <Input
                  placeholder="Médico general"
                  value={form.especialidad}
                  onChange={(e) => update('especialidad', e.target.value)}
                />
              </Field>
              <Field label="Teléfono">
                <Input value={form.telefono} onChange={(e) => update('telefono', e.target.value)} />
              </Field>
            </div>
          )}

          {form.role === 'PACIENTE' && (
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <Field label="Fecha de nacimiento" required>
                <Input
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => update('fechaNacimiento', e.target.value)}
                  required
                />
              </Field>
              <Field label="Género" required>
                <Select value={form.genero} onChange={(e) => update('genero', e.target.value)}>
                  <option value="">Selecciona…</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Otro">Otro</option>
                </Select>
              </Field>
              <Field label="Tipo sanguíneo">
                <Input
                  placeholder="Ej. O+"
                  value={form.tipoSanguineo}
                  onChange={(e) => update('tipoSanguineo', e.target.value)}
                />
              </Field>
            </div>
          )}

          {form.role === 'ADMIN' && (
            <div className="flex items-start gap-2 rounded-lg bg-warning-bg px-3 py-2.5 text-sm text-warning-text">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Alerta de seguridad</p>
                <p>El nuevo Administrador tendrá acceso a todo el sistema. Otorga este rol únicamente a personal de confianza.</p>
              </div>
            </div>
          )}

          {form.role !== 'MEDICO' && (
            <Field label="Teléfono">
              <Input value={form.telefono} onChange={(e) => update('telefono', e.target.value)} />
            </Field>
          )}

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Estado de cuenta</p>
              <p className="text-xs text-slate-500">Acceso habilitado</p>
            </div>
            <button
              type="button"
              onClick={() => update('activo', !form.activo)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.activo ? 'bg-brand-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.activo ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <Field label={isEditMode ? 'Nueva contraseña' : 'Contraseña'} required={!isEditMode}>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder={isEditMode ? 'Dejar en blanco para no cambiarla' : undefined}
                required={!isEditMode}
              />
            </Field>
            <Field label="Confirmar contraseña" required={!isEditMode || !!form.password}>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                required={!isEditMode || !!form.password}
              />
            </Field>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Requisitos de seguridad</p>
              <ul className="list-inside list-disc text-brand-700/90">
                <li>Mínimo 6 caracteres</li>
                <li>No debe ser compartida con otros usuarios</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="destructive" onClick={() => navigate('/usuarios')}>
              <XCircle className="h-4 w-4" /> Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              <CheckCircle2 className="h-4 w-4" /> Guardar usuario
            </Button>
          </div>
        </form>
      </Card>
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
