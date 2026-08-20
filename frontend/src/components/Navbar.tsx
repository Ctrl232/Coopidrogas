import { Link } from 'react-router-dom';
import logoCoopidrogas from '../assets/LogoCoopiWhite.svg'; 

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'NotiSalud', href: '/notisalud' },
  { label: 'Contáctanos', href: '/contacto' },
];

export default function Navbar() {
  return (
    <header className="bg-[#1a1a4e] rounded-2xl mx-32 mt-4 px-6 py-2 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <img
          src={logoCoopidrogas}
          alt="Coopidrogas"
          className="h-8 md:h-9 w-auto object-contain"
        />
      </Link>

      {/* Agrupamos nav + botón para que se muevan juntos hacia la derecha */}
      <div className="hidden md:flex items-center gap-10">
        <nav className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-white/90 hover:text-white text-base font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="bg-amber-400 hover:bg-amber-500 text-[#1a1a4e] font-semibold text-sm px-4 py-1.5 rounded-full">
          Droguerías cercanas
        </button>
      </div>
    </header>
  );
}