// Debe coincidir EXACTO con el enum Role de prisma/schema.prisma en el backend
export type Role = 'ADMIN' | 'MEDICO' | 'RECEPCION' | 'PACIENTE';

export interface AuthUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

// Etiquetas legibles y color de acento por rol (para badges en Usuarios, header, etc.)
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  RECEPCION: 'Recepción',
  PACIENTE: 'Paciente',
};

export const ROLE_BADGE_STYLES: Record<Role, string> = {
  ADMIN: 'bg-brand-100 text-brand-700',
  MEDICO: 'bg-sky-100 text-sky-700',
  RECEPCION: 'bg-warning-bg text-warning-text',
  PACIENTE: 'bg-slate-100 text-slate-600',
};
