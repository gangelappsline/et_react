import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MonthCalendar, { ymdLocal } from './MonthCalendar';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://mexspacioinmobiliarios.com.mx/api';

function toSqlDateTime(local) {
  if (!local) return '';
  // Expect input like 'YYYY-MM-DDTHH:mm' or 'YYYY-MM-DDTHH:mm:ss'
  const [date, time] = String(local).split('T');
  if (!date || !time) return String(local).replace('T', ' '); // best effort
  const parts = time.split(':');
  const hh = parts[0] || '00';
  const mm = parts[1] || '00';
  let ss = parts[2] || '00';
  if (ss.includes('.')) ss = ss.split('.')[0];
  return `${date} ${hh}:${mm}:${ss}`;
}

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('cancel')) return 'bg-red-100 text-red-700';
  if (s.includes('pend')) return 'bg-yellow-100 text-yellow-700';
  if (s.includes('confirm') || s.includes('paid')) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
}

function parseReservation(res) {
  // Intenta normalizar campos comunes
  const dt = res.scheduled_at || res.datetime || res.date || res.created_at;
  const d = dt ? new Date(dt) : null;
  return {
    id: res.id ?? `${dt}-${res.email ?? res.name ?? Math.random()}`,
    name: res.user?.name || res.name || res.full_name || 'Sin nombre',
    email: res.user?.email || res.email || '',
    phone: res.user?.phone || res.phone || '',
    status: res.status || (res.paid ? 'Confirmada' : 'Pendiente'),
    amount: res.amount || res.price || null,
    notes: res.notes || res.note || '',
    service: res.service || null,
    datetime: d,
    raw: res,
  };
}

function groupByDay(items) {
  const map = new Map();
  items.forEach((it) => {
    const key = it.datetime ? it.datetime.toISOString().slice(0, 10) : 'Sin fecha';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  });
  // Ordena por fecha
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, arr]) => ({
      key,
      label:
        key === 'Sin fecha'
          ? 'Sin fecha'
          : new Date(key + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
      items: arr.sort((x, y) => (x.datetime && y.datetime ? x.datetime - y.datetime : 0)),
    }));
}

export default function AdminCalendar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState([]);
  const [selected, setSelected] = useState(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0..11
  const [selectedDayKey, setSelectedDayKey] = useState(ymdLocal(today));
  const [createOpen, setCreateOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', service_id: '', date: '', comments: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
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
        const res = await fetch(`${API_BASE}/reservations`, {
          headers,
          signal: controller.signal,
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          if (res.status === 401 || res.status === 419) {
            localStorage.removeItem('et-mexspacios-token');
            navigate('/login');
            return;
          }
          throw new Error(data?.message || 'No se pudieron obtener las reservaciones');
        }
        const parsed = Array.isArray(data)
          ? data.map(parseReservation)
          : Array.isArray(data?.data)
          ? data.data.map(parseReservation)
          : [];
        setReservations(parsed);
        // Default selection: today or first item
        const hasToday = parsed.some((r) => r.datetime && ymdLocal(r.datetime) === ymdLocal(new Date()));
        setSelectedDayKey(hasToday ? ymdLocal(new Date()) : (parsed[0]?.datetime ? ymdLocal(parsed[0].datetime) : selectedDayKey));
        // Auto-select first reservation of selected day
        const firstOfDay = parsed.find((r) => r.datetime && ymdLocal(r.datetime) === (hasToday ? ymdLocal(new Date()) : (parsed[0]?.datetime ? ymdLocal(parsed[0].datetime) : selectedDayKey)));
        setSelected(firstOfDay || parsed[0] || null);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const grouped = useMemo(() => groupByDay(reservations), [reservations]);
  const countsByDay = useMemo(() => {
    const map = {};
    for (const r of reservations) {
      if (!r.datetime) continue;
      const key = ymdLocal(r.datetime);
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [reservations]);
  const dayReservations = useMemo(() => {
    return reservations
      .filter((r) => r.datetime && ymdLocal(r.datetime) === selectedDayKey)
      .sort((a, b) => (a.datetime && b.datetime ? a.datetime - b.datetime : 0));
  }, [reservations, selectedDayKey]);
  const metrics = useMemo(() => {
    const total = reservations.length;
    const cancel = reservations.filter((r) => (r.status || '').toLowerCase().includes('cancel')).length;
    const confirm = reservations.filter((r) => (r.status || '').toLowerCase().includes('confirm') || r.status === 'Confirmada').length;
    const pending = total - confirm - cancel;
    return { total, confirm, cancel, pending };
  }, [reservations]);

  const goPrevMonth = () => {
    let m = viewMonth - 1;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const goNextMonth = () => {
    let m = viewMonth + 1;
    let y = viewYear;
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  async function reloadReservations() {
    try {
      setLoading(true);
      setError('');
      const token = (localStorage.getItem('et-mexspacios-token') || '').trim();
      const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/reservations`, { headers });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        if (res.status === 401 || res.status === 419) {
          localStorage.removeItem('et-mexspacios-token');
          navigate('/login');
          return;
        }
        throw new Error(data?.message || 'No se pudieron obtener las reservaciones');
      }
      const parsed = Array.isArray(data)
        ? data.map(parseReservation)
        : Array.isArray(data?.data)
        ? data.data.map(parseReservation)
        : [];
      setReservations(parsed);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }

  async function loadServices() {
    try {
      const token = (localStorage.getItem('et-mexspacios-token') || '').trim();
      const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/services`, { headers });
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
    } catch (e) {
      // noop; handled on submit if needed
    }
  }

  function openCreateModal() {
    setForm({ name: '', email: '', service_id: '', date: '', comments: '' });
    setFormError('');
    setCreateOpen(true);
    loadServices();
  }

  async function submitCreate(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const token = (localStorage.getItem('et-mexspacios-token') || '').trim();
      const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const payload = {
        name: form.name,
        email: form.email,
        service_id: form.service_id ? Number(form.service_id) : undefined,
        date: toSqlDateTime(form.date),
        comments: form.comments,
      };
      const res = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || res.status === 419) {
          localStorage.removeItem('et-mexspacios-token');
          navigate('/login');
          return;
        }
        throw new Error(data?.message || 'No se pudo crear la reservación');
      }
      setCreateOpen(false);
      await reloadReservations();
      if (payload.date) {
        const key = payload.date.slice(0, 10);
        setSelectedDayKey(key);
      }
    } catch (e) {
      setFormError(e.message || 'Error al crear la reservación');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Citas', value: metrics.total },
          { label: 'Confirmadas', value: metrics.confirm },
          { label: 'Canceladas', value: metrics.cancel },
          { label: 'Pendientes', value: metrics.pending },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className="text-2xl font-bold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end mb-2">
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
        >
          + Nueva reservación
        </button>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <MonthCalendar
            year={viewYear}
            month={viewMonth}
            countsByDay={countsByDay}
            selectedKey={selectedDayKey}
            onSelect={(key) => {
              setSelectedDayKey(key);
              const first = reservations.find((r) => r.datetime && ymdLocal(r.datetime) === key);
              setSelected(first || null);
            }}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
          />
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Reservaciones del día</h2>
              {loading && <span className="text-sm text-gray-500">Cargando…</span>}
            </div>
            {error && (
              <div className="p-3 mb-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
            )}
            {!loading && dayReservations.length === 0 && !error && (
              <div className="text-sm text-gray-500">No hay reservaciones para esta fecha.</div>
            )}
            <div className="space-y-2">
              {dayReservations.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {console.log(it); setSelected(it)}}
                  className={
                    'w-full text-left bg-white border rounded-lg p-3 hover:shadow transition ' +
                    (selected?.id === it.id ? 'border-teal-600 shadow' : 'border-gray-200')
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">
                      {it.datetime ? it.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${statusBadge(it.status)}`}>{it.status || '—'}</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1 line-clamp-1">{it.name}</div>
                  {it.email && <div className="text-xs text-gray-500">{it.email}</div>}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3">Detalle</h3>
            {!selected ? (
              <div className="text-sm text-gray-500">Selecciona una reservación para ver los detalles.</div>
            ) : (
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-500">Cliente</div>
                  <div className="font-semibold">{selected.name}</div>
                  {selected.email && <div className="text-gray-600">{selected.email}</div>}
                  {selected.phone && <div className="text-gray-600">{selected.phone}</div>}
                </div>
                <div>
                  <div className="text-gray-500">Fecha y hora</div>
                  <div className="font-medium">{selected.datetime ? selected.datetime.toLocaleString() : '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Estado</div>
                  <span className={`px-2 py-1 rounded text-xs ${statusBadge(selected.status)}`}>{selected.status || '—'}</span>
                </div>
                {selected.amount != null && (
                  <div>
                    <div className="text-gray-500">Monto</div>
                    <div className="font-medium">${selected.amount}</div>
                  </div>
                )}
                {selected.notes && (
                  <div>
                    <div className="text-gray-500">Notas</div>
                    <div className="text-gray-700">{selected.notes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {createOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Nueva reservación</h3>
              <button onClick={() => setCreateOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {formError && (
              <div className="p-3 mb-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">{formError}</div>
            )}
            <form onSubmit={submitCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.service_id}
                  onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value }))}
                  required
                >
                  <option value="" disabled>Seleccione un servicio</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name || s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={form.comments}
                  onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={formLoading} className={`px-3 py-2 rounded text-white ${formLoading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
