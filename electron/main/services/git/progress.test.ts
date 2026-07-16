import { describe, expect, it, vi } from 'vitest';

import { CLONE_PROGRESS_CHANNEL, emitCloneProgress } from './progress';

const buildWebContentsStub = () => ({
  send: vi.fn()
});

describe('emitCloneProgress', () => {
  it('sends payload to the right channel', () => {
    const wc = buildWebContentsStub();
    emitCloneProgress(wc as never, 'Receiving objects: 50%');
    expect(wc.send).toHaveBeenCalledWith(CLONE_PROGRESS_CHANNEL, {
      message: 'Receiving objects: 50%'
    });
  });

  it('uses stable channel name git:clone:progress', () => {
    expect(CLONE_PROGRESS_CHANNEL).toBe('git:clone:progress');
  });
});