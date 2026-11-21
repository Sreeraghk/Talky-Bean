import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear volatile transient states that could cause corrupt state loops
    try {
      localStorage.removeItem('langeasy_active_tab');
      localStorage.removeItem('deutschbuddy_active_tab');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#181715] text-[#FAF9F5] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#252320] border border-[#33312D] rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Something went wrong</h1>
              <p className="text-xs text-[#A09D96] leading-relaxed">
                The application encountered an unexpected display issue during startup. Your vocabulary and learning progress are safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-left overflow-x-auto text-[11px] font-mono text-orange-400/90 max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/20"
              >
                <RefreshCw size={14} />
                <span>Reload App</span>
              </button>
              <button
                onClick={() => {
                  window.location.href = '/app';
                }}
                className="py-3 px-4 bg-[#1F1E1B] hover:bg-[#33312D] text-[#A09D96] hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#33312D]"
              >
                <Home size={14} />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
