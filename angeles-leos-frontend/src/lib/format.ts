import type { EstadoCita } from '@/types/domain';
import type { BadgeProps } from '@/components/ui/Badge';

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatCurrency(value: string | number): string {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

export function isSameDay(iso: string, reference: Date = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

export const ESTADO_CITA_LABELS: Record<EstadoCita, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export const ESTADO_CITA_VARIANTS: Record<EstadoCita, NonNullable<BadgeProps['variant']>> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'success',
  COMPLETADA: 'brand',
  CANCELADA: 'danger',
};
