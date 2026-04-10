import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Rol } from '../types';
import { ShoppingCart, LogIn, User, Shield, Briefcase } from 'lucide-react';

export default function LoginMock() {
  const login = useStore(state => state.login);
  const navigate = useNavigate();
  const [selectedRol, setSelectedRol] = useState<Rol>('Vendedor');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRol);
    navigate('/pos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-white drop-shadow-lg">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30 shadow-xl">
             <ShoppingCart size={48} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md tracking-tight">
          Punto Mosca
        </h2>
        <p className="mt-2 text-center text-sm text-indigo-100 font-medium">
          Sistema Avanzado de POS y Créditos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/50">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div className="text-center pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Modo Prototipo</h3>
              <p className="text-sm text-gray-500">Selecciona el rol que deseas simular para esta sesión.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Seleccionar Rol</label>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRol('Vendedor')}
                  className={`flex items-center justify-between px-4 py-3 border rounded-xl shadow-sm focus:outline-none transition-all ${
                    selectedRol === 'Vendedor' 
                    ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <User className={`h-5 w-5 mr-3 ${selectedRol === 'Vendedor' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="block font-medium">Vendedor</span>
                  </div>
                  {selectedRol === 'Vendedor' && <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRol('Encargado')}
                  className={`flex items-center justify-between px-4 py-3 border rounded-xl shadow-sm focus:outline-none transition-all ${
                    selectedRol === 'Encargado' 
                    ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Briefcase className={`h-5 w-5 mr-3 ${selectedRol === 'Encargado' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="block font-medium">Encargado de Sucursal</span>
                  </div>
                  {selectedRol === 'Encargado' && <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRol('Admin')}
                  className={`flex items-center justify-between px-4 py-3 border rounded-xl shadow-sm focus:outline-none transition-all ${
                    selectedRol === 'Admin' 
                    ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Shield className={`h-5 w-5 mr-3 ${selectedRol === 'Admin' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="block font-medium">Administrador</span>
                  </div>
                  {selectedRol === 'Admin' && <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Ingresar al Sistema
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
