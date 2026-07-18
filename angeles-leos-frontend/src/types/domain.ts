import type { Role } from './auth';

export interface MedicoPerfil {
  id: string;
  cedulaProfesional: string;
  especialidad: string;
}

export interface PacientePerfil {
  id: string;
  nombreCompleto: string;
  edad: number;
  fechaNacimiento: string;
  genero: string;
  tipoSanguineo: string | null;
}

export interface UserAccount {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: Role;
  telefono: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  medicoPerfil: MedicoPerfil | null;
  pacientePerfil: PacientePerfil | null;
}

export interface Paciente {
  id: string;
  nombreCompleto: string;
  edad: number;
  fechaNacimiento: string;
  genero: string;
  tipoSanguineo: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicoBasic {
  id: string;
  cedulaProfesional: string;
  especialidad: string;
  userId: string;
  user: {
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
  };
}

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

export interface Appointment {
  id: string;
  fechaHora: string;
  motivo: string | null;
  estado: EstadoCita;
  pacienteId: string;
  medicoId: string;
  paciente?: Paciente;
  medico?: {
    id: string;
    especialidad: string;
    user: { nombre: string; apellido: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Medicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion?: string;
}

export interface Prescription {
  id: string;
  codigoReceta: string;
  medicalRecordId: string;
  medicoId: string;
  medicamentos: Medicamento[];
  indicacionesGenerales: string | null;
  firmaMedico: string | null;
  fechaEmision: string;
  createdAt: string;
  updatedAt: string;
}

export type TipoTransaccion = 'INGRESO' | 'EGRESO';

export interface Finance {
  id: string;
  tipo: TipoTransaccion;
  concepto: string;
  monto: string; // Prisma Decimal serializado como string
  fecha: string;
  pacienteId: string | null;
  createdAt: string;
}
