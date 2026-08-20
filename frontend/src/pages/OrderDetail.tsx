import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const statusLabels: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const statusColors: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  CONFIRMADO: 'bg-blue-100 text-blue-700',
  ENVIADO: 'bg-indigo-100 text-indigo-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 mt-8 flex-1 w-full">
        {isLoading && <p className="text-gray-500">Cargando pedido...</p>}
        {isError && <p className="text-red-600">No se pudo cargar el pedido.</p>}

        {order && (
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-[#1a1a4e]">Pedido #{order.id.slice(0, 8)}</h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Sede: {order.branch.name} — {order.branch.address}
            </p>

            <div className="divide-y border-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-[#1a1a4e]">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ${Number(item.unitPrice).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <span className="font-medium text-[#1a1a4e]">
                    ${(item.quantity * Number(item.unitPrice)).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 text-lg font-bold text-[#1a1a4e]">
              <span>Total</span>
              <span>${Number(order.total).toLocaleString('es-CO')}</span>
            </div>

            <Link to="/catalogo" className="block text-center mt-6 text-sm text-[#1a1a4e] font-medium hover:underline">
              Seguir comprando
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}