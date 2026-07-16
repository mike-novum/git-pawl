import type { CommitMessage } from '../../../shared/types/git';

const isMultiLine = (text: string): boolean => text.includes('\n');

export const formatCommitMessage = (message: CommitMessage): string => {
  if (typeof message === 'string') {
    return message;
  }
  const parts = [message.header];
  if (message.body) parts.push(message.body);
  if (message.footer) parts.push(message.footer);
  return parts.join('\n\n');
};

export const needsMessageFile = (formatted: string): boolean =>
  isMultiLine(formatted);