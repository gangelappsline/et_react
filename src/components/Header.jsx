import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-2 px-4 gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo-negro.png" alt="Logo" className=" w-14" />
        </div>
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-col md:flex-row md:gap-6 text-sm text-gray-700 font-medium">
            <a href="#" className="hover:text-teal-700">Inicio</a>
            <a href="#servicios" className="hover:text-teal-700">Servicios</a>
            <a href="#equipo" className="hover:text-teal-700">Equipo</a>
            <a href="#contacto" className="hover:text-teal-700">Contacto</a>
            <a href="/login" className="hover:text-teal-700">Login</a>
          </div>
          <div className="flex items-center gap-4 text-teal-700 text-lg">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end text-xs text-gray-500">
          <span>Haz una llamada</span>
          <span className="font-bold text-teal-700 text-base">+52 123-456-7890</span>
        </div>
      </div>
    </header>
  );
}
