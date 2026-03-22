/**
 * ErrorBoundary — Catches unhandled errors in child components.
 *
 * Features:
 *  - Shows user-friendly error screen instead of white screen
 *  - Retry button to re-render children
 *  - Logs errors for debugging
 *  - Different messages for network vs render errors
 */

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, isNetworkError: false };

  static getDerivedStateFromError(error: Error): State {
    const isNetworkError =
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to load") ||
      error.name === "TypeError";

    return { hasError: true, error, isNetworkError };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isNetworkError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {this.state.isNetworkError ? "Connection issue" : "Something went wrong"}
          </h2>

          <p className="text-gray-500 mb-6 max-w-md">
            {this.state.isNetworkError
              ? "We couldn't reach the server. Check your connection and try again."
              : "An unexpected error occurred. This has been logged and we're looking into it."}
          </p>

          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = "/home"}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go home
            </button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-8 text-left max-w-lg w-full">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">
                Error details
              </summary>
              <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs text-red-600 overflow-auto max-h-48">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary — HOC wrapper for pages.
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function BoundedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
