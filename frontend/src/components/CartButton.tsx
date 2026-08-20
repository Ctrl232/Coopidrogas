import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartButton() {
  const location = useLocation();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  if (location.pathname === '/carrito' || itemCount === 0) return null;

  return (
    <Link
      to="/carrito"
      className="fixed bottom-28 right-6 bg-[#1a1a4e] hover:bg-[#12123a] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.98-4.706 2.545-7.187.075-.34-.183-.663-.53-.663H5.106M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>

      <span className="absolute -top-1 -right-1 bg-amber-400 text-[#1a1a4e] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {itemCount}
      </span>
    </Link>
  );
}