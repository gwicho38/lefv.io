import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <div className="flex gap-4">
            <Button onClick={this.handleReset} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}