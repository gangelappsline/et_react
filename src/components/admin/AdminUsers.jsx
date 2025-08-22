import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://mexspacioinmobiliarios.com.mx/api';

function normalizeUser(u) {
  return {
    id: u.id ?? u.user_id ?? u.email ?? u.name ?? Math.random().toString(36).slice(2),
    name: u.name || u.full_name || u.username || 'Sin nombre',
    email: u.email || '',
    created_at: u.created_at || u.registered_at || null,
    status: u.status || (u.active ? 'Activo' : 'Inactivo'),
    avatar: u.avatar || u.photo || u.profile_photo_url || null,
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError('');
      try {
        const token = (localStorage.getItem('et-mexspacios-token') || '').trim();
        const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/users?role=5`, { headers, signal: controller.signal });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          if (res.status === 401 || res.status === 419) {
            localStorage.removeItem('et-mexspacios-token');
            navigate('/login');
            return;
          }
          throw new Error(data?.message || 'No se pudieron obtener los usuarios');
        }
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setUsers(list.map(normalizeUser));
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [navigate]);

  const total = users.length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Usuarios</h2>
      </div>
      {error && (
        <div className="p-3 mb-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
      )}
      <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha de registro
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-500">Cargando…</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-500">Sin usuarios</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <img
                            className="w-full h-full rounded-full"
                            src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 whitespace-no-wrap">{u.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{u.email}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${String(u.status).toLowerCase().includes('inac') ? 'text-gray-700' : 'text-green-900'}`}>
                        <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${String(u.status).toLowerCase().includes('inac') ? 'bg-gray-200' : 'bg-green-200'}`}></span>
                        <span className="relative">{u.status || '—'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-5 py-5 bg-white border-t flex items-center justify-between">
            <span className="text-xs xs:text-sm text-gray-900">{`Mostrando ${total} usuario${total === 1 ? '' : 's'}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
