import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import buildingImg from '../assets/BACKGROUND-IMG NUESTRO PROPÓSITO.svg'; 

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

type Stat = {
  value: string;
  label: string;
};

// ---------- Datos ----------
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

const stats: Stat[] = [
  { value: '+6700', label: 'Asociados' },
  { value: '+32', label: 'Departamentos' },
  { value: '+10000', label: 'Droguerías' },
  { value: '+816', label: 'Municipios' },
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
    <div className="relative max-w-[1600px] w-full mx-auto mt-8 h-[560px] flex items-center justify-center [perspective:1200px]">
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
              translateX(${offset * 70}%)
              translateZ(${isActive ? 0 : -250}px)
              rotateY(${offset * -25}deg)
              scale(${isActive ? 1 : 0.75})
            `,
            opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.5,
            zIndex: isActive ? 10 : 5 - Math.abs(offset),
            transition: 'transform 0.6s ease, opacity 0.6s ease',
          };

          return (
            <div
              key={slide.id}
              className="absolute w-[68%] max-w-[850px] h-[500px] rounded-2xl overflow-hidden shadow-xl cursor-pointer"
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

// ---------- Sección "Conoce acerca de nuestra esencia" ----------
function AboutSection() {
  return (
    <section className="max-w-6xl mx-auto mt-24 px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      {/* Columna izquierda: texto */}
      <div>
        <h2 className="text-3xl font-bold text-[#1a1a4e]">
          Conoce acerca de <span className="font-extrabold">nuestra esencia</span>
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Estamos donde nos necesitas, trabajando para hacer la vida mejor.
        </p>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Coopidrogas, la red de droguistas detallistas más grande de Colombia.
        </p>

        {/* Grid de estadísticas */}
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2"
            >
              <span className="text-amber-500 font-bold text-lg">{stat.value}</span>
              <span className="text-[#1a1a4e] text-sm font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        <button className="mt-8 bg-amber-400 hover:bg-amber-500 text-[#1a1a4e] font-semibold px-6 py-3 rounded-full">
          Conoce más
        </button>
      </div>

      {/* Columna derecha: imagen */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <img
          src={buildingImg}
          alt="Sede de Coopidrogas"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}

// ---------- Banner de aliados en loop continuo ----------
function PartnersBanner() {
  const loopPartners: Partner[] = [...partners, ...partners];

  return (
    <section className="max-w-[1600px] w-full mx-auto mt-16 bg-white border rounded-xl py-6 overflow-hidden">
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
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
        {/* Conoce acerca de nuestra esencia */}
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}