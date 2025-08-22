
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaGoogle, FaApple } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://mexspacioinmobiliarios.com.mx/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || 'Credenciales incorrectas.';
        throw new Error(msg);
      }

      const token = data?.access_token || data?.token || data?.data?.access_token || data?.data?.token;
      if (!token) {
        throw new Error('No se recibió el token de acceso.');
      }

      localStorage.setItem('et-mexspacios-token', token);
      localStorage.setItem('et-mexspacios-user', JSON.stringify(data.user));
      navigate('/admin/calendar');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <img src="/logo-negro.png" alt="Logo" className="mx-auto w-40" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaUser />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 pr-4 h-12 w-full rounded-full bg-white border border-border focus:outline-none focus:ring-2 focus:ring-brand-muted text-text-base placeholder-text-muted"
                placeholder="correo@dominio.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaLock />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-12 h-12 w-full rounded-full bg-white border border-border focus:outline-none focus:ring-2 focus:ring-brand-muted text-text-base placeholder-text-muted"
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-dark"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Mostrar contraseña"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0012 6c3.978 0 7.437 2.19 9.02 5.223a1.724 1.724 0 010 1.554A10.477 10.477 0 0112 18c-3.978 0-7.437-2.19-9.02-5.223a1.724 1.724 0 010-1.554z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0115 12m-3 3a3 3 0 01-3-3m3 3c.795 0 1.558-.232 2.195-.634m-2.195.634L6.53 17.47m2.195-.634A10.477 10.477 0 013.98 8.223m0 0a1.724 1.724 0 010-1.554A10.477 10.477 0 0112 6c3.978 0 7.437 2.19 9.02 5.223a1.724 1.724 0 010 1.554m-1.664 2.727L6.53 6.53" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error */}
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-full font-semibold bg-black text-white text-base shadow-md transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-dark hover:brightness-110'
              }`}
            >
              {loading ? 'Accediendo...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-4 text-xs text-center text-text-muted">
            <NavLink to="/" className="text-brand-dark font-semibold hover:underline">
              Página de Inicio
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
