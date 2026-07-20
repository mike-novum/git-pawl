import { describe, expect, it } from 'vitest';

import { toFileUrl } from './toFileUrl';

describe('toFileUrl', () => {
  it('converts an absolute unix path', () => {
    expect(toFileUrl('/Users/me/icon.png')).toBe('file:///Users/me/icon.png');
  });

  it('escapes special characters in filename', () => {
    expect(toFileUrl('/Users/me/icon test.png')).toBe(
      'file:///Users/me/icon%20test.png'
    );
  });

  it('escapes hash fragments so they are not treated as URL fragment', () => {
    expect(toFileUrl('/Users/me/icon#1.png')).toBe(
      'file:///Users/me/icon%231.png'
    );
  });

  it('escapes question marks so they are not treated as URL query', () => {
    expect(toFileUrl('/Users/me/icon?ver=1.png')).toBe(
      'file:///Users/me/icon%3Fver%3D1.png'
    );
  });

  it('normalizes windows-style backslashes', () => {
    expect(toFileUrl('C:\\Users\\me\\icon.png')).toBe(
      'file:///C%3A/Users/me/icon.png'
    );
  });

  it('handles a relative path by adding the third slash', () => {
    expect(toFileUrl('Users/me/icon.png')).toBe('file:///Users/me/icon.png');
  });
});