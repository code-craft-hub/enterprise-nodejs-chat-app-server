import React, { Component, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallbackPath?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route Error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Page failed to load
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error loading this page.
            </p>
            <div className="space-x-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              {this.props.fallbackPath && (
                <Navigate to={this.props.fallbackPath} replace />
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}