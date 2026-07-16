import { describe, expect, it } from 'vitest';

import { getAppInfo } from './ipc';

describe('ipc', () => {
  it('returns fallback app info when bridge is not available', async () => {
    const info = await getAppInfo();

    expect(info.name).toBe('git-pawl');
    expect(info.version).toBeTypeOf('string');
  });
});
