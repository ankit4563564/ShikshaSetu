'use client';

import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class CommunityErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="text-4xl">⚠️</span>
          <p className="text-sm font-bold text-deep-teal/60">Something went wrong</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-deep-teal px-4 py-2 text-xs font-bold text-white"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
