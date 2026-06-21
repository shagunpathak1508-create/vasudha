/**
 * ErrorBoundary
 *
 * React class-based error boundary that catches runtime errors in its subtree
 * and renders a friendly fallback UI instead of crashing the entire app.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <MyPage />
 * </ErrorBoundary>
 * ```
 *
 * Features:
 * - "Try Again" button calls reset() and re-renders the subtree
 * - "Go Home" link navigates to the root URL
 * - Logs errors to console in development
 * - Styled to match the Vasudha glass-card design system
 */

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  /** The subtree to render normally when no error is present. */
  children: ReactNode;
  /**
   * Optional custom fallback UI. Receives the error and a reset function.
   * When omitted, the default Vasudha-styled fallback is shown.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches any uncaught JavaScript error thrown within its child component tree
 * and renders a styled recovery screen. Wrap route-level page components with
 * this boundary so that errors in one page cannot crash the entire application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[Vasudha] ErrorBoundary caught an error:", error, info.componentStack);
  }

  /**
   * Reset the error state so the child subtree is re-mounted and re-rendered.
   * Called by the "Try Again" button in the default fallback UI.
   */
  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback(this.state.error, this.reset);
    }

    return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
  }
}

// ─── Default Fallback UI ──────────────────────────────────────────────────────

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[60vh] items-center justify-center px-6 py-12"
    >
      <div className="glass-card flex max-w-md flex-col items-center gap-5 rounded-3xl p-10 text-center">
        {/* Icon */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-4xl"
          aria-hidden="true"
          style={{ background: "color-mix(in oklab, var(--color-destructive) 20%, transparent)" }}
        >
          🌍
        </div>

        <div>
          <h2 className="font-display text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            An unexpected error occurred on this page.
            {import.meta.env.DEV && (
              <span className="mt-2 block text-xs font-mono opacity-60">
                {error.message}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="glow-primary rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, var(--color-secondary), var(--color-accent))",
              color: "var(--color-secondary-foreground)",
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            className="glass-card rounded-full px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
