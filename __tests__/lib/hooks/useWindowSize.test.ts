import { renderHook, act } from '@testing-library/react';
import useWindowSize from '@/lib/hooks/useWindowSize';

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  const setWindowSize = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
  };

  afterEach(() => {
    setWindowSize(originalInnerWidth, originalInnerHeight);
  });

  it('should return initial window size', () => {
    setWindowSize(1024, 768);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.windowSize.width).toBe(1024);
    expect(result.current.windowSize.height).toBe(768);
  });

  it('should identify mobile viewport (width < 768)', () => {
    setWindowSize(375, 667);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should identify desktop viewport (width >= 768)', () => {
    setWindowSize(1024, 768);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should identify exactly 768 as desktop', () => {
    setWindowSize(768, 1024);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should update on window resize', () => {
    setWindowSize(1024, 768);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.windowSize.width).toBe(1024);
    expect(result.current.isDesktop).toBe(true);

    act(() => {
      setWindowSize(375, 667);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.windowSize.width).toBe(375);
    expect(result.current.isMobile).toBe(true);
  });

  it('should cleanup resize listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useWindowSize());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
