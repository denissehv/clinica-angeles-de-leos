import {
  LayoutGrid,
  Users,
  CalendarDays,
  FileClock,
  FileText,
  Wallet,
  UserCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types/auth';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Principal', to: '/dashboard', icon: LayoutGrid, roles: ['ADMIN', 'MEDICO', 'RECEPCION', 'PACIENTE'] },
  { label: 'Usuarios', to: '/usuarios', icon: Users, roles: ['ADMIN'] },
  { label: 'Citas', to: '/citas', icon: CalendarDays, roles: ['ADMIN', 'RECEPCION', 'MEDICO'] },
  { label: 'Historial', to: '/historial', icon: FileClock, roles: ['ADMIN', 'MEDICO', 'PACIENTE'] },
  { label: 'Expedientes', to: '/expedientes', icon: FileText, roles: ['ADMIN', 'MEDICO', 'PACIENTE'] },
  { label: 'Finanzas', to: '/finanzas', icon: Wallet, roles: ['ADMIN', 'RECEPCION'] },
  { label: 'Mi Perfil', to: '/perfil', icon: UserCircle, roles: ['ADMIN', 'MEDICO', 'RECEPCION', 'PACIENTE'] },
];
