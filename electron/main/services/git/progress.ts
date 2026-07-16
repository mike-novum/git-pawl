import type { WebContents } from 'electron';

export const CLONE_PROGRESS_CHANNEL = 'git:clone:progress';

export type CloneProgressPayload = { message: string };

export const emitCloneProgress = (webContents: WebContents, msg: string): void => {
  webContents.send(CLONE_PROGRESS_CHANNEL, { message: msg } satisfies CloneProgressPayload);
};