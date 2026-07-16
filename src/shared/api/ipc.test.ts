import { describe, expect, it } from 'vitest';

import { api } from './ipc';

describe('api', () => {
  it('returns fallback app info when bridge is not available', async () => {
    const info = await api.getAppInfo();

    expect(info.name).toBe('git-pawl');
    expect(info.version).toBeTypeOf('string');
  });
});
