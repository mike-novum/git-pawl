import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && !window.PointerEvent) {
  window.PointerEvent = window.MouseEvent as unknown as typeof PointerEvent;
}
