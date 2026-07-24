'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  portalName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      // Log to console for now
      console.error('Error details:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        portal: this.props.portalName,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
          <div className="w-full max-w-md rounded-2xl border border-warm-clay/20 bg-white p-8 shadow-lg">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-warm-clay/10">
              <svg
                className="h-8 w-8 text-warm-clay"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="mb-2 font-display text-2xl font-extrabold text-ink">
              Something went wrong
            </h1>
            
            <p className="mb-6 text-sm leading-relaxed text-muted">
              {this.props.portalName
                ? `An error occurred in the ${this.props.portalName}. `
                : 'An unexpected error occurred. '}
              We've logged the issue and will investigate. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 rounded-xl bg-warm-clay/5 p-4">
                <summary className="cursor-pointer text-xs font-bold text-warm-clay">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-3 overflow-auto text-[11px] text-muted">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-98"
              >
                Refresh Page
              </button>
              
              <a
                href="/"
                className="rounded-xl border border-primary/20 bg-white px-6 py-3 text-center text-sm font-bold text-primary transition-all hover:bg-primary/5 active:scale-98"
              >
                Go to Home
              </a>
            </div>

            <p className="mt-6 text-center text-xs text-muted">
              If this issue persists, please contact support at{' '}
              <a href="mailto:support@shikshasetu.com" className="font-bold text-primary hover:underline">
                support@shikshasetu.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
