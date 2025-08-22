import { useEffect, useMemo, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

// Helpers de fechas (JS puro)
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addDays = (d, n) => {
  const dd = new Date(d);
  dd.setDate(dd.getDate() + n);
  return dd;
};
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const isSameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isBeforeToday = (d) => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd < t;
};

function buildMonthMatrix(current) {
  const first = startOfMonth(current);
  const last = endOfMonth(current);
  const startWeekOffset = (first.getDay() + 6) % 7; // lunes
  const gridStart = addDays(first, -startWeekOffset);
  const days = [];
  for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
  return { days, first, last };
}

function Calendar({ value, onChange }) {
  const [viewDate, setViewDate] = useState(value || new Date());
  const { days, first } = useMemo(() => buildMonthMatrix(viewDate), [viewDate]);
  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          ‹
        </button>
        <div className="font-semibold capitalize text-gray-900">{monthName}</div>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = d.getMonth() === first.getMonth();
          const disabled = isBeforeToday(d) || !inMonth;
          const selected = value && isSameDay(value, d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onChange && onChange(d)}
              className={
                'h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm transition ' +
                (selected
                  ? 'bg-teal-600 text-white shadow'
                  : disabled
                  ? 'text-gray-300'
                  : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700')
              }
              title={d.toLocaleDateString()}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SchedulingSection() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payingService, setPayingService] = useState(null);
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [mpReady, setMpReady] = useState(false);
  const [reservationComments, setReservationComments] = useState('');
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [payForm, setPayForm] = useState({
    email: '',
    service_id: '',
    name: '',
    holder_name: '',
    card_number: '',
    cvv: '',
    expiration_month: '',
    expiration_year: '',
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://mexspacioinmobiliarios.com.mx/api';
  const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || '';

  useEffect(() => {
    // Init Mercado Pago SDK (safe no-op if key missing)
    try {
      if (MP_PUBLIC_KEY) {
        initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-MX' });
        setMpReady(true);
      }
    } catch (_) {
      setMpReady(false);
    }
  }, [MP_PUBLIC_KEY]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingServices(true);
      setServicesError('');
      try {
        const res = await fetch(`${API_BASE}/services`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('No se pudo cargar servicios');
        const data = await res.json();
        if (active) setServices(Array.isArray(data?.data) ? data.data : data);
      } catch (e) {
        if (active) setServicesError(e.message || 'Error al cargar servicios');
      } finally {
        if (active) setLoadingServices(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [API_BASE]);

  const openPaymentModal = (svc) => {
    setPayingService(svc);
    setPayError('');
    setPayForm((f) => ({ ...f, service_id: svc?.id ?? '' }));
    setPaymentModalOpen(true);
  };
  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPayingService(null);
  };

  const submitPaymentWithMP = async (cardData) => {
    // cardData: { token, paymentMethodId, issuerId, installments }
    setPayError('');
    if (!payForm.email || !payForm.name || !payForm.service_id) {
      setPayError('Completa tu nombre y email.');
      return;
    }
    setPaySubmitting(true);
    try {
      const amount = parseFloat(payingService?.price ?? payingService?.amount ?? 0) || 0;
      const res = await fetch(`${API_BASE}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: payForm.email,
          service_id: String(payForm.service_id),
          name: payForm.name,
          mp_token: cardData?.token,
          payment_method_id: cardData?.paymentMethodId,
          issuer_id: cardData?.issuerId ? String(cardData.issuerId) : '',
          installments: cardData?.installments ? Number(cardData.installments) : 1,
          amount,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'No se pudo procesar el pago');
      const txnId = data?.transaction_id || data?.id || data?.data?.transaction_id || data?.data?.id || '';
      setPaymentTxnId(String(txnId));
      setSelectedService(payingService);
      setPaymentSuccess(true);
      closePaymentModal();
    } catch (err) {
      setPayError(err.message || 'Error al procesar el pago');
    } finally {
      setPaySubmitting(false);
    }
  };

  const combineDateTime = (date, timeStr) => {
    if (!date || !timeStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    let [_, h, m, ap] = match;
    let hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    if (ap.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (ap.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const toSqlDateTime = (d) => {
    if (!d) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
  };

  const handleSchedule = async () => {
    setReservationError('');
    console.log(selectedService);
    if (!selectedService) {
      setReservationError('Selecciona un servicio antes de confirmar.');
      return;
    }
    console.log(paymentTxnId);
    if (!paymentTxnId) {
      setReservationError('No se encontró la transacción de pago.');
      return;
    }
    console.log(selectedDate);
    console.log(selectedTime);
    if (selectedDate && selectedTime) {
      const dt = combineDateTime(selectedDate, selectedTime);
      setScheduledAt(dt);
      try {
        setReservationSubmitting(true);
        const userRaw = localStorage.getItem('et-mexspacios-user');
        let userId = '';
        if (userRaw) { try { const u = JSON.parse(userRaw); userId = String(u?.id || u?.user_id || ''); } catch {}
        }
        const payload = {
          user_id: userId,
          service_id: String(selectedService?.id ?? ''),
          date: toSqlDateTime(dt),
          transaction_id: String(paymentTxnId),
          comments: reservationComments || '',
        };
        const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
        const token = localStorage.getItem('et-mexspacios-token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/reservations`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'No se pudo crear la reservación');
        setAppointmentConfirmed(true);
      } catch (err) {
        setReservationError(err.message || 'Error al crear la reservación');
      } finally {
        setReservationSubmitting(false);
      }
    }
  };

  return (
    <section id="agendar" className="bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">Agenda tu Asesoría</h2>

        {!paymentSuccess ? (
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 max-w-4xl mx-auto">
            <p className="text-gray-700 mb-6 text-center">Selecciona un servicio y reserva para poder agendar tu videollamada.</p>
            {loadingServices ? (
              <div className="text-center text-gray-500">Cargando servicios…</div>
            ) : servicesError ? (
              <div className="text-center text-red-600">{servicesError}</div>
            ) : services.length === 0 ? (
              <div className="text-center text-gray-500">No hay servicios disponibles por ahora.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc) => {
                  const price = parseFloat(svc.price ?? svc.amount ?? 0).toFixed(2);
                  return (
                    <div key={svc.id || svc.name} className="border border-gray-200 rounded-lg p-4 flex flex-col">
                      <div className="font-semibold text-gray-900">{svc.name || 'Servicio'}</div>
                      {svc.description && <div className="text-sm text-gray-600 mt-1 line-clamp-3">{svc.description}</div>}
                      <div className="mt-3 text-lg font-bold text-teal-700">${price} MXN</div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => openPaymentModal(svc)}
                          className="w-full px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : !appointmentConfirmed ? (
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 grid md:grid-cols-[1.2fr_1fr] gap-8">
            {/* Columna izquierda: Calendario */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Selecciona una fecha</h3>
              </div>
              <Calendar value={selectedDate} onChange={setSelectedDate} />

              <div className="mt-6">
                <div className="text-sm text-gray-500 mb-1">Zona horaria</div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="America/Mexico_City">Hora CDMX (México)</option>
                  <option value="America/Bogota">Colombia</option>
                  <option value="America/New_York">Eastern time - US & Canada</option>
                  <option value="America/Chicago">Central - US</option>
                  <option value="America/Los_Angeles">Pacific - US</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            {/* Columna derecha: Horarios */}
            <div>
              <div className="mb-4">
                {selectedService && (
                  <div className="text-sm text-teal-700 font-medium mb-1">Servicio: {selectedService.name} (${parseFloat(selectedService.price ?? selectedService.amount ?? 0).toFixed(2)} MXN)</div>
                )}
                <div className="text-sm text-gray-500">{selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Elige una fecha'}</div>
                <h3 className="text-lg font-semibold text-gray-900">Selecciona un horario</h3>
              </div>

              <div className="space-y-3">
                {['10:00 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <div key={slot} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={
                          'flex-1 px-4 py-3 rounded-lg border text-left transition ' +
                          (isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-teal-600')
                        }
                      >
                        {slot}
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={handleSchedule}
                          className="px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-center text-green-700">
            <h3 className="text-2xl font-bold">¡Cita Confirmada!</h3>
            <p className="mt-2">Recibirás un correo con los detalles de tu cita para el {scheduledAt?.toLocaleString()} ({timezone}).</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closePaymentModal} />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Completa tu reserva</div>
              <button type="button" className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={closePaymentModal} aria-label="Cerrar">
                <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {payingService && (
              <div className="mb-4 text-sm text-gray-700">
                Servicio: <span className="font-medium">{payingService.name}</span>
              </div>
            )}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre del cliente</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={payForm.name} onChange={(e) => setPayForm({ ...payForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={payForm.email} onChange={(e) => setPayForm({ ...payForm, email: e.target.value })} required />
                </div>
              </div>

              {mpReady ? (
                <CardPayment
                  initialization={{
                    amount: parseFloat(payingService?.price ?? payingService?.amount ?? 0) || 0,
                    payer: { email: payForm.email || '' },
                  }}
                  onSubmit={async (cardData) => {
                    await submitPaymentWithMP(cardData);
                  }}
                  onError={(err) => setPayError(err?.message || 'Error con el pago')}
                />
              ) : (
                <div className="text-sm text-gray-500">Configura VITE_MP_PUBLIC_KEY para habilitar Mercado Pago.</div>
              )}

              {payError && <div className="text-red-600 text-sm text-center">{payError}</div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
