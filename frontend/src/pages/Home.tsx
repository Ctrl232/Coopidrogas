import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ---------- Tipos ----------
type Slide = {
  id: number;
  img: string;
  alt: string;
};

type Partner = {
  name: string;
  logo: string;
};

// ---------- Datos (reemplaza rutas por tus imágenes reales) ----------
const slides: Slide[] = [
  { id: 1, img: 'src/assets/Banner-principal-home-Desktop-ComunicadoColombia-1550x930px-12-08-2026.jpg', alt: 'Miles de droguerías en Colombia' },
  { id: 2, img: 'src/assets/Banner-principal-home-Desktop-01-07-2026.jpg', alt: 'En Colombia nos unimos por el bienestar de todos' },
  { id: 3, img: 'src/assets/Banner-principal-home-Desktop-Afiliados-1-08-2026.jpg', alt: 'Sea parte del grupo de droguistas' },
];

const partners: Partner[] = [
  { name: 'Coopicrédito', logo: 'src/assets/logo-coopicredtio.png' },
  { name: 'Farmacenter', logo: 'src/assets/logo-farmacenter.jpeg' },
  { name: 'ICOM', logo: 'src/assets/logo-icompharma.jpeg' },
  { name: 'Corpidroguistas', logo: 'src/assets/corpidroguistas-logo.png' },
  { name: 'Fundación Coopi', logo: 'src/assets/Fundecopi-logo-sombras.png' },
];

// ---------- Carrusel tipo "coverflow" ----------
function Carousel() {
  const [current, setCurrent] = useState<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    timeoutRef.current = setTimeout(next, 4000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current]);

  const getOffset = (index: number): number => {
    let offset = index - current;
    if (offset > slides.length / 2) offset -= slides.length;
    if (offset < -slides.length / 2) offset += slides.length;
    return offset;
  };

  return (
    <div className="relative max-w-5xl mx-auto mt-8 h-[420px] flex items-center justify-center [perspective:1200px]">
      <button
        onClick={prev}
        className="absolute left-2 z-20 text-3xl text-gray-500 hover:text-[#1a1a4e]"
        aria-label="Anterior"
      >
        ‹
      </button>

      <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
        {slides.map((slide: Slide, index: number) => {
          const offset = getOffset(index);
          const isActive = offset === 0;

          const style: React.CSSProperties = {
            transform: `
              translateX(${offset * 55}%)
              translateZ(${isActive ? 0 : -200}px)
              rotateY(${offset * -25}deg)
              scale(${isActive ? 1 : 0.8})
            `,
            opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.5,
            zIndex: isActive ? 10 : 5 - Math.abs(offset),
            transition: 'transform 0.6s ease, opacity 0.6s ease',
          };

          return (
            <div
              key={slide.id}
              className="absolute w-[70%] max-w-[600px] rounded-2xl overflow-hidden shadow-xl cursor-pointer"
              style={style}
              onClick={() => setCurrent(index)}
            >
              <img src={slide.img} alt={slide.alt} className="w-full h-full object-cover" />
            </div>
          );
        })}
      </div>

      <button
        onClick={next}
        className="absolute right-2 z-20 text-3xl text-gray-500 hover:text-[#1a1a4e]"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-[-28px] flex gap-2">
        {slides.map((_: Slide, index: number) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === current ? 'bg-[#1a1a4e]' : 'bg-gray-300'
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Banner de aliados en loop continuo ----------
function PartnersBanner() {
  const loopPartners: Partner[] = [...partners, ...partners];

  return (
    <section className="max-w-5xl mx-auto mt-16 bg-white border rounded-xl py-6 overflow-hidden">
      <div className="flex w-max animate-marquee gap-16">
        {loopPartners.map((p: Partner, i: number) => (
          <img
            key={`${p.name}-${i}`}
            src={p.logo}
            alt={p.name}
            className="h-8 md:h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
          />
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

// ---------- Página principal ----------
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Carrusel principal */}
      <Carousel />

      {/* Aliados en banner continuo */}
      <PartnersBanner />

      {/* CTA de login */}
      <section className="max-w-5xl mx-auto mt-16 mb-16 flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
        <h2 className="text-2xl font-bold text-[#1a1a4e]">Sistema de Integración y Promoción</h2>
        <Link
          to="/login"
          className="bg-[#1a1a4e] hover:bg-[#12123a] text-white font-semibold px-6 py-3 rounded-lg"
        >
          Ingresa a SIP
        </Link>
      </section>

      <Footer />
    </div>
  );
}