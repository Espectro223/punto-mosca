import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import rataImg from '../assets/rata-al-404.jpg';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Error Boundary: captura errores de runtime de cualquier componente hijo
 * y muestra la página de error con la rata en lugar de romper toda la app.
 * Nota: los Error Boundaries deben ser clases (limitación de React).
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Error capturado:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.href = '/pos';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-8 text-white">
        <div className="text-center max-w-lg w-full">
          <p className="text-8xl font-black text-red-400 opacity-20 select-none leading-none mb-4">ERR</p>

          <div className="relative -mt-8 mb-6">
            <img
              src={rataImg}
              alt="Error inesperado"
              className="w-72 mx-auto rounded-2xl shadow-2xl border-4 border-red-500/30"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
              Algo salió mal 🐭
            </div>
          </div>

          <h1 className="text-2xl font-extrabold mt-6 mb-2">Error inesperado</h1>
          <p className="text-slate-400 text-sm mb-3">
            Ocurrió un error en la aplicación. El equipo técnico ha sido notificado.
          </p>

          {this.state.errorMessage && (
            <pre className="bg-slate-800 text-red-300 text-xs rounded-xl p-3 mb-6 text-left overflow-x-auto">
              {this.state.errorMessage}
            </pre>
          )}

          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
}
