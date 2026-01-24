import { test, expect, describe, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/pages/hooks/use-mobile';

describe('useIsMobile hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns correct value for mobile', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test('returns correct value for desktop', () => {
    // Mock window.innerWidth for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test('handles undefined initial state', () => {
    // The hook initializes with undefined, then calculates
    const { result } = renderHook(() => useIsMobile());
    
    // After initial render, it should be a boolean
    expect(typeof result.current).toBe('boolean');
  });
});