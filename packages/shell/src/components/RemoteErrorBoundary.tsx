import React, { Component, ReactNode } from 'react';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
  name?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

class RemoteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[MFE Error] ${this.props.name || 'Remote'} failed to load:`, error);
  }

  handleRetry = () => {
    this.props.onRetry?.();
    this.setState((prev) => ({
      hasError: false,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isExhausted = this.state.retryCount >= 3;

      return (
        <div className="p-8 text-center border border-secondary-200 dark:border-secondary-700 rounded bg-secondary-50 dark:bg-secondary-800">
          <p className="text-secondary-600 dark:text-secondary-300 text-lg">
            ⚠️ {this.props.name || 'Module'} is currently unavailable.
          </p>
          <p className="text-secondary-400 dark:text-secondary-500 text-sm mt-2">
            {isExhausted
              ? 'This service may be down. Please try again later.'
              : 'This micro-frontend is deployed independently and may be temporarily down.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
          {this.state.retryCount > 0 && (
            <p className="text-secondary-400 text-xs mt-2">
              Retry attempts: {this.state.retryCount}
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default RemoteErrorBoundary;
