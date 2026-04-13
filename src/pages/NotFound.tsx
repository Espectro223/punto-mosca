import { useNavigate } from 'react-router-dom';
import rataImg from '../assets/rata-al-404.jpg';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center max-w-lg w-full">
        {/* Código de error */}
        <p className="text-8xl font-black text-indigo-400 opacity-20 select-none leading-none mb-4">404</p>

        {/* Imagen de la rata */}
        <div className="relative -mt-8 mb-6">
          <img
            src={rataImg}
            alt="Rata al 404"
            className="w-72 mx-auto rounded-2xl shadow-2xl border-4 border-indigo-500/30"
          />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            ¡Alguien llegó donde no debía! 🐭
          </div>
        </div>

        {/* Texto */}
        <h1 className="text-2xl font-extrabold mt-6 mb-2 text-white">
          Página no encontrada
        </h1>
        <p className="text-indigo-300 text-sm mb-8">
          La ruta que intentaste acceder no existe o no está disponible para tu rol.
        </p>

        {/* Acciones */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-indigo-500 text-indigo-200 hover:bg-indigo-800 transition-colors text-sm font-medium"
          >
            ← Volver
          </button>
          <button
            onClick={() => navigate('/pos')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-sm font-bold shadow-lg"
          >
            Ir al POS
          </button>
        </div>
      </div>
    </div>
  );
}
