import type { FC } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib/theme';

import { parseAnsi } from './ansi';
import type { AnsiColor } from './ansi';
import type { TerminalLineKind, TerminalOutputProps } from './types';

const DEFAULT_MAX_LINES = 5000;

const KIND_CLASSES: Record<TerminalLineKind, string> = {
  stderr: 'text-red-500',
  stdout: 'text-muted-foreground',
  info: 'text-blue-500'
};

const ANSI_CLASSES: Record<AnsiColor, string> = {
  red: 'text-red-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500'
};

export const TerminalOutput: FC<TerminalOutputProps> = ({
  lines,
  maxLines = DEFAULT_MAX_LINES,
  className
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const rendered = useMemo(
    () =>
      (lines.length > maxLines ? lines.slice(-maxLines) : lines).map((line) => ({
        id: line.id,
        kind: line.kind,
        tokens: parseAnsi(line.text)
      })),
    [lines, maxLines]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [rendered]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'bg-background border-border h-full w-full overflow-auto rounded-md border font-mono text-xs leading-relaxed',
        className
      )}
    >
      <pre className="m-0 p-3">
        <code>
          {rendered.map((line, idx) => (
            <div
              key={line.id ?? idx}
              className={cn('whitespace-pre-wrap break-words', KIND_CLASSES[line.kind])}
            >
              {line.tokens.map((token, ti) => (
                <span
                  key={ti}
                  className={token.color ? ANSI_CLASSES[token.color] : undefined}
                >
                  {token.text}
                </span>
              ))}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

TerminalOutput.displayName = 'TerminalOutput';
