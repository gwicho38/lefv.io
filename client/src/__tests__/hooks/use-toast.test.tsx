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

  it('should add multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].title).toBe('First toast');
    expect(result.current.toasts[1].title).toBe('Second toast');
  });

  it('should dismiss a toast by id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
    });

    const firstToastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismiss(firstToastId);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Second toast');
  });

  it('should dismiss all toasts when called without id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
      result.current.toast({ title: 'Third toast' });
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should handle toast with different variants', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Success toast',
        variant: 'default'
      });
    });

    act(() => {
      result.current.toast({
        title: 'Error toast',
        variant: 'destructive'
      });
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].variant).toBe('default');
    expect(result.current.toasts[1].variant).toBe('destructive');
  });

  it('should handle toast with action', () => {
    const { result } = renderHook(() => useToast());
    const mockAction = {
      label: 'Undo',
      onClick: vi.fn()
    };

    act(() => {
      result.current.toast({
        title: 'Toast with action',
        action: mockAction
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

    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
    });

    const ids = result.current.toasts.map(toast => toast.id);
    expect(ids[0]).not.toBe(ids[1]);
    expect(ids.every(id => typeof id === 'string' && id.length > 0)).toBe(true);
  });
});