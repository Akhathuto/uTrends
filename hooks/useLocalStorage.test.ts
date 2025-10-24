// @vitest-environment jsdom
// FIX: Import vitest globals to resolve test runner errors.
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with the initial value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should initialize with value from localStorage if it exists', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when the value is changed', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('should handle object values', () => {
    const initialValue = { name: 'uTrends' };
    const newValue = { name: 'Edgtec' };
    const { result } = renderHook(() => useLocalStorage('object-key', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(window.localStorage.getItem('object-key')).toBe(JSON.stringify(newValue));
  });
  
  it('should handle function as initial value', () => {
    const { result } = renderHook(() => useLocalStorage('fn-key', () => 'initial-from-fn'));
    expect(result.current[0]).toBe('initial-from-fn');
  });
});