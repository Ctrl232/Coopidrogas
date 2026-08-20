import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCartStore } from '../store/cartStore';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const addItem = useCartStore((state) => state.addItem);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.listCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { search, categoryId }],
    queryFn: () => catalogApi.listProducts({ search: search || undefined, categoryId }),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 mt-8 flex-1">
        <h1 className="text-2xl font-bold text-[#1a1a4e] mb-6">Catálogo de productos</h1>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-2 flex-1"
          />
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Todas las categorías</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className="text-gray-500">Cargando productos...</p>}
        {isError && <p className="text-red-600">No se pudieron cargar los productos.</p>}

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items.map((product) => (
            <div key={product.id} className="bg-white border rounded-lg p-4 flex flex-col">
              <span className="text-xs text-amber-600 font-medium">{product.category.name}</span>
              <h3 className="font-semibold text-[#1a1a4e] mt-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mt-1 flex-1">{product.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-lg text-[#1a1a4e]">
                  ${Number(product.price).toLocaleString('es-CO')}
                </span>
                <button
                  onClick={() => addItem(product)}
                  className="bg-[#1a1a4e] text-white text-sm px-3 py-1.5 rounded-md hover:bg-[#12123a]"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>

        {data && data.items.length === 0 && (
          <p className="text-gray-500 text-center mt-10">No se encontraron productos.</p>
        )}
      </div>

      <Footer />
    </div>
  );
}