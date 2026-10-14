import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StreamHub VIP ErrorBoundary capturou um erro:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      // Clear session storage & reload
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  private handleResetAll = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Erro inesperado na aplicação.';
      const isHookOrChunkError =
        errorMessage.includes('Invalid hook call') ||
        errorMessage.includes('Cannot read properties of null') ||
        errorMessage.includes('Failed to fetch dynamically imported module');

      return (
        <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white">
          <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              {isHookOrChunkError ? 'Atualização Concluída' : 'Instabilidade Detectada'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              {isHookOrChunkError
                ? 'Uma nova versão do StreamHub VIP foi carregada no servidor. Clique no botão abaixo para sincronizar a página.'
                : 'Ocorreu um erro ao carregar este módulo. Você pode recarregar a página com segurança.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleResetAll}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700/50"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Voltar ao Início & Limpar Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
