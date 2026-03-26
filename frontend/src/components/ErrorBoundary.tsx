import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from './Alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="error" title="Something went wrong">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  We're sorry, but something unexpected happened. The error has been logged and our team will look into it.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <summary className="cursor-pointer text-sm font-mono text-slate-700">
                      Error Details (Development Only)
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
