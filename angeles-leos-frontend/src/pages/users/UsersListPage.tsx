import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/format';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '@/types/auth';
import type { Role } from '@/types/auth';
import type { UserAccount } from '@/types/domain';

const PAGE_SIZE = 8;

export function UsersListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'TODOS'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [page, setPage] = useState(1);

  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<UserAccount[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchesRole = roleFilter === 'TODOS' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'TODOS' ||
        (statusFilter === 'ACTIVO' ? u.activo : !u.activo);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setSearch('');
    setRoleFilter('TODOS');
    setStatusFilter('TODOS');
    setPage(1);
  }

  async function handleDelete() {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el usuario');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de usuarios</h1>
          <p className="text-slate-500">Administre el personal de la clínica, roles y permisos de acceso al sistema.</p>
        </div>
        <Button onClick={() => navigate('/usuarios/nuevo')}>
          <UserPlus className="h-4 w-4" /> Registrar usuario
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</div>
      )}

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o correo..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-slate-500">Rol:</span>
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as Role | 'TODOS');
                setPage(1);
              }}
              className="w-40"
            >
              <option value="TODOS">Todos</option>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-slate-500">Estado:</span>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'TODOS' | 'ACTIVO' | 'INACTIVO');
                setPage(1);
              }}
              className="w-36"
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </Select>
          </div>
          <button
            onClick={resetFilters}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
            title="Limpiar filtros"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Correo electrónico</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Fecha creación</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Cargando usuarios…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No se encontraron usuarios con esos filtros.
                  </td>
                </tr>
              ) : (
                paged.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {u.nombre.charAt(0)}
                          {u.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {u.nombre} {u.apellido}
                          </p>
                          <p className="text-xs text-slate-400">ID: {u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge className={ROLE_BADGE_STYLES[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={u.activo ? 'success' : 'neutral'}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/usuarios/${u.id}/editar`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
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
        open={!!userToDelete}
        title="¿Eliminar este usuario?"
        description={`Esta acción eliminará la cuenta de ${userToDelete?.nombre} ${userToDelete?.apellido} de forma permanente. Si es un paciente, su expediente clínico se conserva.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
