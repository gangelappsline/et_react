import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8 px-4 mt-auto animate-fade-in-up">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo192.png" alt="Logo" className="h-10 w-10" />
          <span className="font-bold text-lg">LegalInmo</span>
        </div>
        <nav className="flex gap-6">
          <a href="#" className="hover:underline">Inicio</a>
          <a href="#contacto" className="hover:underline">Contacto</a>
          <a href="/login" className="hover:underline">Login</a>
        </nav>
        <div className="flex gap-4 text-2xl">
          <a href="#" aria-label="Facebook"><FaFacebook /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" aria-label="Twitter"><FaTwitter /></a>
        </div>
      </div>
      <div className="text-center text-xs mt-4 opacity-70">&copy; {new Date().getFullYear()} LegalInmo. Todos los derechos reservados.</div>
    </footer>
  );
}
