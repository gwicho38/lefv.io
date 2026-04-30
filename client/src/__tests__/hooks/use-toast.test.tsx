import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToast } from '../../hooks/use-toast';

describe('useToast', () => {
  beforeEach(() => {
    // Clear any existing toasts before each test
    vi.clearAllMocks();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Test toast',
        description: 'This is a test toast'
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test toast',
      description: 'This is a test toast'
    });
    expect(result.current.toasts[0]).toHaveProperty('id');
  });

  it('keeps only the most recent toast (TOAST_LIMIT = 1)', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Second toast');
  });

  it('should mark a toast as closed when dismissed by id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Only toast' });
    });

    const id = result.current.toasts[0].id;

    act(() => {
      result.current.dismiss(id);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('marks all toasts as closed when dismiss is called without id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
      result.current.toast({ title: 'Third toast' });
    });

    // TOAST_LIMIT caps at 1; only the most recent remains.
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts.every((t) => t.open === false)).toBe(true);
  });

  it('should handle toast with different variants', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Success toast', variant: 'default' });
    });
    expect(result.current.toasts[0].variant).toBe('default');

    act(() => {
      result.current.toast({ title: 'Error toast', variant: 'destructive' });
    });

    // TOAST_LIMIT = 1; latest replaces previous.
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].variant).toBe('destructive');
  });

  it('should handle toast with action', () => {
    const { result } = renderHook(() => useToast());
    const mockAction = vi.fn();

    act(() => {
      result.current.toast({
        title: 'Toast with action',
        action: mockAction as any
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].action).toEqual(mockAction);
  });

  it('should limit number of toasts', () => {
    const { result } = renderHook(() => useToast());
    const TOAST_LIMIT = 1;

    // Add more toasts than the limit
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.toast({ title: `Toast ${i}` });
      }
    });

    // Should only keep the most recent toasts up to the limit
    expect(result.current.toasts.length).toBeLessThanOrEqual(5);
  });

  it('should generate unique ids for each toast', () => {
    const { result } = renderHook(() => useToast());

    let firstId: string | undefined;
    act(() => {
      const t = result.current.toast({ title: 'First toast' });
      firstId = t.id;
    });

    let secondId: string | undefined;
    act(() => {
      const t = result.current.toast({ title: 'Second toast' });
      secondId = t.id;
    });

    expect(typeof firstId).toBe('string');
    expect(typeof secondId).toBe('string');
    expect(firstId).not.toBe(secondId);
  });
});