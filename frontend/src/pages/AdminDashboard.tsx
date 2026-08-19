import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold text-[#1a1a4e]">Panel de Administración</h1>
      <p className="text-gray-600 mt-2">Bienvenido, {user?.email}</p>
      <button onClick={handleLogout} className="mt-6 bg-red-600 text-white px-4 py-2 rounded-md">
        Cerrar sesión
      </button>
    </div>
  );
}