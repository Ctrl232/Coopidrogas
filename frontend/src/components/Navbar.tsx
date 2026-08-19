import { Link } from 'react-router-dom';

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Comunidad', href: '/comunidad' },
  { label: 'NotiSalud', href: '/notisalud' },
  { label: 'Contáctanos', href: '/contacto' },
];

export default function Navbar() {
  return (
    <header className="bg-[#1a1a4e] rounded-2xl mx-4 mt-4 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-white font-bold text-xl">
        Coopidrogas
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link key={link.href} to={link.href} className="text-white/90 hover:text-white text-sm font-medium">
            {link.label}
          </Link>
        ))}
      </nav>

      <button className="bg-amber-400 hover:bg-amber-500 text-[#1a1a4e] font-semibold text-sm px-4 py-2 rounded-full">
        Droguerías cercanas
      </button>
    </header>
  );
}