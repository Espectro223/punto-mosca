import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShoppingCart, LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginMock() {
  const login = useStore(state => state.login);
  const loginError = useStore(state => state.loginError);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulamos una latencia de red para que se sienta más real
    await new Promise(res => setTimeout(res, 600));

    const ok = login(email, password);
    setIsLoading(false);

    if (ok) {
      navigate('/pos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30 shadow-xl">
            <ShoppingCart size={48} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md tracking-tight">
          Punto Mosca
        </h2>
        <p className="mt-2 text-center text-sm text-indigo-100">
          Sistema de Punto de Venta y Créditos — Grupo N&amp;N
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/50">
          
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-6">
            Iniciar Sesión
          </h3>

          <form className="space-y-5" onSubmit={handleLogin}>

            {/* Error de credenciales */}
            {loginError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@puntomosca.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} /> Ingresar al Sistema
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Credenciales de demo */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Usuarios de demostración
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <p className="text-center text-gray-400 font-medium mt-1 mb-2">🏢 Sucursal Centro (con créditos)</p>
              {[
                { nombre: 'Juana.R',  rol: 'Admin',     email: 'Juana.R@puntomosca.com',  pass: 'admin123'     },
                { nombre: 'Facu.GG',  rol: 'Encargado', email: 'Facu.GG@puntomosca.com',  pass: 'encargado123' },
                { nombre: 'Edgar.K',  rol: 'Vendedor',  email: 'Edgar.K@puntomosca.com',  pass: 'vendedor123'  },
                { nombre: 'Luca.V',   rol: 'Vendedor',  email: 'Luca.V@puntomosca.com',   pass: 'vendedor456'  },
              ].map(u => (
                <button key={u.email} type="button" onClick={() => { setEmail(u.email); setPassword(u.pass); }}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-gray-100 cursor-pointer">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{u.nombre}</span>
                    <span className="text-gray-400">{u.rol}</span>
                  </div>
                  <span className="font-mono text-gray-400">{u.email}</span>
                </button>
              ))}
              <p className="text-center text-gray-400 font-medium mt-3 mb-2">🏢 Sucursal Norte (sin créditos)</p>
              {[
                { nombre: 'Carlos.M', rol: 'Encargado', email: 'Carlos.M@puntomosca.com', pass: 'encargado456' },
                { nombre: 'Maria.P',  rol: 'Vendedor',  email: 'Maria.P@puntomosca.com',  pass: 'vendedor789'  },
              ].map(u => (
                <button key={u.email} type="button" onClick={() => { setEmail(u.email); setPassword(u.pass); }}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-gray-100 cursor-pointer">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{u.nombre}</span>
                    <span className="text-gray-400">{u.rol}</span>
                  </div>
                  <span className="font-mono text-gray-400">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
