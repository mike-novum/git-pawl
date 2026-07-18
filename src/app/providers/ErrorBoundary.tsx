import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { Button } from '@/shared/ui';

export type ErrorBoundaryProps = {
  children: ReactNode;
};

export type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }
    return (
      <div className="bg-background text-foreground flex h-full w-full flex-col items-center justify-center gap-4 p-6">
        <div className="flex max-w-xl flex-col items-center gap-3 text-center">
          <h1 className="text-foreground text-2xl font-semibold">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm">
            {error.message || 'An unexpected error occurred while rendering this view.'}
          </p>
          <pre className="text-muted-foreground bg-muted/30 border-border max-h-64 w-full overflow-auto rounded-md border p-3 text-left font-mono text-xs">
            {error.stack ?? error.message}
          </pre>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              this.setState({ error: null });
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }
}

(ErrorBoundary as unknown as { displayName: string }).displayName = 'ErrorBoundary';