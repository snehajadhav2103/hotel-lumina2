import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      let errorMessage = 'Something went wrong.';
      
      try {
        // Check if it's a Firestore error JSON
        const parsed = JSON.parse(error?.message || '');
        if (parsed.error) {
          errorMessage = `Firestore Error: ${parsed.error} (${parsed.operationType} on ${parsed.path})`;
        }
      } catch {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-4">
          <div className="card-sleek p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Application Error</h2>
            <p className="text-text-muted mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
