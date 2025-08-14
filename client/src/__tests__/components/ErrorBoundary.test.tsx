import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary, useErrorHandler } from '../../components/ErrorBoundary';

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component to test useErrorHandler hook
const TestErrorHandler = () => {
  const handleError = useErrorHandler();
  
  return (
    <div>
      <button onClick={() => handleError(new Error('Hook error'))}>
        Throw Error
      </button>
      <div>Hook component</div>
    </div>
  );
};

describe('ErrorBoundary', () => {
  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should reset error state when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should reload page when Refresh Page is clicked', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /refresh page/i }));

    expect(mockReload).toHaveBeenCalledOnce();
  });

  it('should log error to console in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Console.error should be called (mocked)
    expect(consoleSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('useErrorHandler', () => {
  it('should throw error when called', () => {
    expect(() => {
      render(
        <ErrorBoundary>
          <TestErrorHandler />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Throw Error'));
    }).not.toThrow(); // The error boundary catches it

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Hook error')).toBeInTheDocument();
  });

  it('should render normally when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <TestErrorHandler />
      </ErrorBoundary>
    );

    expect(screen.getByText('Hook component')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /throw error/i })).toBeInTheDocument();
  });
});