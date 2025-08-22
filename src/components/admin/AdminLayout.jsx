import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

function ActiveIcon({ route }) {
  const common = 'w-6 h-6';
  if (route.includes('/admin/calendar')) {
    // calendar icon
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0f766e" strokeWidth="1.5"/>
        <path d="M8 2v4M16 2v4M3 10h18" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (route.includes('/admin/services')) {
    // toolbox / briefcase icon
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" stroke="#0f766e" strokeWidth="1.5"/>
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="#0f766e" strokeWidth="1.5"/>
        <path d="M3 12h18" stroke="#0f766e" strokeWidth="1.5"/>
      </svg>
    );
  }
  // users icon default
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#0f766e" strokeWidth="1.5"/>
      <path d="M4 20a8 8 0 1 1 16 0" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const section = useMemo(() => {
    if (location.pathname.includes('/admin/calendar')) return 'Calendario';
    if (location.pathname.includes('/admin/services')) return 'Servicios';
    if (location.pathname.includes('/admin/users')) return 'Usuarios';
    return 'Panel Administrativo';
  }, [location.pathname]);

  const user = useMemo(() => {
    const raw = localStorage.getItem('et-mexspacios-user');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, []);

  const userName = user?.name || user?.full_name || user?.username || user?.email || 'Usuario';
  const userEmail = user?.email || '';
  const userAvatar = user?.avatar || user?.photo || user?.profile_photo_url || null;

  const initials = (userName || userEmail || 'U')
    .split(' ')
    .map((s) => s.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const logout = () => {
    localStorage.removeItem('et-mexspacios-token');
    localStorage.removeItem('et-mexspacios-user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f6fbfd] text-gray-800 grid grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex bg-white border-r border-gray-200 p-4 flex-col gap-2">
        <div className="font-extrabold text-teal-700 text-xl mb-2">LegalInmo Admin</div>
        <NavLink to="/admin/calendar" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}>Calendario</NavLink>
  <NavLink to="/admin/services" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}>Servicios</NavLink>
  <NavLink to="/admin/users" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}>Usuarios</NavLink>
      </aside>

      {/* Mobile off-canvas sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="font-extrabold text-teal-700 text-lg">LegalInmo Admin</div>
              <button
                type="button"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50"
                aria-label="Cerrar menú"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <NavLink to="/admin/calendar" onClick={() => setSidebarOpen(false)} className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}>Calendario</NavLink>
            <NavLink to="/admin/services" onClick={() => setSidebarOpen(false)} className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}>Servicios</NavLink>
            <NavLink to="/admin/users" onClick={() => setSidebarOpen(false)} className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'}`}>Usuarios</NavLink>
          </aside>
        </div>
      )}
      <main className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
              <ActiveIcon route={location.pathname} />
            </div>
            <div>
              <div className="font-semibold text-3xl">{section}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 border border-gray-200"
              >
                {userAvatar ? (
                  <img src={`https://ui-avatars.com/api/?name=${userName}`} alt={userName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium hidden lg:block text-gray-800 max-w-[140px] truncate">{userName}</span>
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); navigate('/admin/users'); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Editar perfil
                  </button>
                  <div className="h-px bg-gray-200" />
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
