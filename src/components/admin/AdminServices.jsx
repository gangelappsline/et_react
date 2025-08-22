import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://mexspacioinmobiliarios.com.mx/api';

function ServiceRow({ service, onEdit, onDelete }) {
  return (
    <tr className="border-b">
      <td className="p-3 font-medium text-gray-800">{service.name || service.title || '-'}</td>
      <td className="p-3 text-gray-600">{service.description || '-'}</td>
      <td className="p-3 text-gray-600">{service.price != null ? `$${service.price}` : '-'}</td>
      <td className="p-3 text-right">
        <button onClick={() => onEdit(service)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500 text-white hover:bg-amber-600 mr-2"><FaEdit /> Editar</button>
        <button onClick={() => onDelete(service)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700"><FaTrash /> Eliminar</button>
      </td>
    </tr>
  );
}

function ServiceForm({ initial, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initial?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ id: initial?.id, name, description, price: price === '' ? null : Number(price) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input className="w-full border rounded px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea className="w-full border rounded px-3 py-2" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={price} onChange={(e)=>setPrice(e.target.value)} step="0.01" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"><FaTimes/> Cancelar</button>
        <button type="submit" disabled={loading} className={`inline-flex items-center gap-2 px-3 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}>
          <FaSave /> {isEdit ? 'Guardar cambios' : 'Crear servicio'}
        </button>
      </div>
    </form>
  );
}

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const authHeaders = useMemo(() => {
    const token = (localStorage.getItem('et-mexspacios-token') || '').trim();
    const base = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
    return token ? { ...base, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { ...base, 'Content-Type': 'application/json' };
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/services`, { headers: authHeaders });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        if (res.status === 401 || res.status === 419) {
          localStorage.removeItem('et-mexspacios-token');
          navigate('/login');
          return;
        }
        throw new Error(data?.message || 'No se pudieron obtener los servicios');
      }
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setServices(list);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createOrUpdate = async (payload) => {
    const isEdit = Boolean(payload.id);
    const url = isEdit ? `${API_BASE}/services/${payload.id}` : `${API_BASE}/services`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 || res.status === 419) {
        localStorage.removeItem('et-mexspacios-token');
        navigate('/login');
        return;
      }
      throw new Error(data?.message || 'No se pudo guardar el servicio');
    }
    await load();
    setModalOpen(false);
    setEditing(null);
  };

  const remove = async (service) => {
    if (!confirm(`¿Eliminar servicio "${service.name || service.title}"?`)) return;
    const res = await fetch(`${API_BASE}/services/${service.id}`, { method: 'DELETE', headers: authHeaders });
    if (res.status === 204) {
      await load();
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 || res.status === 419) {
        localStorage.removeItem('et-mexspacios-token');
        navigate('/login');
        return;
      }
      throw new Error(data?.message || 'No se pudo eliminar el servicio');
    }
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Servicios</h2>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">
          <FaPlus /> Nuevo servicio
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3 font-medium">Nombre</th>
              <th className="text-left p-3 font-medium">Descripción</th>
              <th className="text-left p-3 font-medium">Precio</th>
              <th className="text-right p-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Cargando…</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Sin servicios</td></tr>
            ) : (
              services.map((s) => (
                <ServiceRow key={s.id || s.name} service={s} onEdit={(svc) => { setEditing(svc); setModalOpen(true); }} onDelete={remove} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{editing ? 'Editar servicio' : 'Nuevo servicio'}</h3>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <ServiceForm initial={editing} onCancel={() => { setModalOpen(false); setEditing(null); }} onSubmit={createOrUpdate} />
          </div>
        </div>
      )}
    </div>
  );
}
