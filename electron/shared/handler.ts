import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import type { z } from 'zod';

import type { IpcChannel } from './ipc-channels';

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');

export const safeHandle = <TSchema extends z.ZodTypeAny>(
  channel: IpcChannel,
  schema: TSchema,
  handler: (args: z.infer<TSchema>, event?: IpcMainInvokeEvent) => unknown
): void => {
  ipcMain.handle(channel, async (event: IpcMainInvokeEvent, args: unknown) => {
    const parsed = schema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid ${channel} payload: ${formatIssues(parsed.error.issues)}`);
    }
    return handler(parsed.data as z.infer<TSchema>, event);
  });
};

export const safeHandleNoArgs = (
  channel: IpcChannel,
  handler: () => unknown
): void => {
  ipcMain.handle(channel, async () => handler());
};
