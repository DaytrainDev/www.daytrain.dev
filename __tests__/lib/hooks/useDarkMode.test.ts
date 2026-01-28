import { renderHook, act } from '@testing-library/react';
import useDarkMode from '@/lib/hooks/useDarkMode';

describe('useDarkMode', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    jest.clearAllMocks();
    document.body.classList.remove('dark');
  });

  it('should initialize with isDark as false when localStorage is empty', () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDark).toBe(false);
  });

  it('should initialize with isDark from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('true');

    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDark).toBe(true);
  });

  it('should toggle dark mode and update localStorage', () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleDark();
    });

    expect(result.current.isDark).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('isDark', 'true');
  });

  it('should toggle dark mode off', () => {
    localStorageMock.getItem.mockReturnValueOnce('true');

    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDark();
    });

    expect(result.current.isDark).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('isDark', 'false');
  });

  it('should add dark class to body when isDark is true', () => {
    localStorageMock.getItem.mockReturnValueOnce('true');

    renderHook(() => useDarkMode());

    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class from body when isDark is false', () => {
    document.body.classList.add('dark');
    localStorageMock.getItem.mockReturnValueOnce('false');

    renderHook(() => useDarkMode());

    expect(document.body.classList.contains('dark')).toBe(false);
  });
});
