import React, { Component, ReactNode } from 'react';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

class RemoteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[MFE Error] ${this.props.name || 'Remote'} failed to load:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center border border-secondary-200 rounded bg-secondary-50">
            <p className="text-secondary-600 text-lg">
              ⚠️ {this.props.name || 'Module'} is currently unavailable.
            </p>
            <p className="text-secondary-400 text-sm mt-2">
              This micro-frontend is deployed independently and may be temporarily down.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default RemoteErrorBoundary;
