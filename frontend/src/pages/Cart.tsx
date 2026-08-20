import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { catalogApi } from '../api/catalog';
import { ordersApi } from '../api/orders';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clear, total } = useCartStore();
  const user = useAuthStore((state) => state.user);

  const [branchId, setBranchId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: catalogApi.listBranches,
  });

  const { mutate: submitOrder, isPending } = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      clear();
      navigate(`/pedidos/${order.id}`);
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('No se pudo crear el pedido. Intenta de nuevo.');
      }
    },
  });

  function handleCheckout() {
    setError(null);

    if (!user) {
      navigate('/login');
      return;
    }
    if (!branchId) {
      setError('Selecciona una sede para recoger tu pedido.');
      return;
    }

    submitOrder({
      branchId: Number(branchId),
      items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 mt-8 flex-1 w-full">
        <h1 className="text-2xl font-bold text-[#1a1a4e] mb-6">Tu carrito</h1>

        {items.length === 0 ? (
          <p className="text-gray-500">Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="bg-white border rounded-lg divide-y">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-[#1a1a4e]">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      ${Number(item.product.price).toLocaleString('es-CO')} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, Math.max(1, Number(e.target.value)))}
                      className="w-16 border rounded-md px-2 py-1 text-center"
                    />
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sede para recoger</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border rounded-md px-3 py-2 mb-4"
              >
                <option value="">Selecciona una sede</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-lg font-bold text-[#1a1a4e] mb-4">
                <span>Total</span>
                <span>${total().toLocaleString('es-CO')}</span>
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={isPending}
                className="w-full bg-[#1a1a4e] text-white py-2.5 rounded-md hover:bg-[#12123a] disabled:opacity-50"
              >
                {isPending ? 'Confirmando pedido...' : 'Confirmar pedido'}
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}