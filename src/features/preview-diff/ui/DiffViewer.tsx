import type { FC } from 'react';
import { FileText, ScanLine } from 'lucide-react';
import type { DiffHunk, DiffLine } from '@electron/shared/types/git';

import { cn } from '@/shared/lib';
import { Empty, Spinner } from '@/shared/ui';

import { useDiff } from '../model';

import type { DiffViewerProps } from './types';

const BINARY_FILE_TITLE = 'Binary file';
const BINARY_FILE_DESCRIPTION =
  'Diff preview is not available for binary files. Use the file manager for details.';
const EMPTY_TITLE = 'No changes';
const EMPTY_DESCRIPTION = 'There are no differences to display for this range.';
const ERROR_TITLE = 'Diff unavailable';
const LOADING_LABEL = 'Loading diff';

const BINARY_EXTENSIONS = new Set<string>([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'ico',
  'webp',
  'tiff',
  'mp3',
  'wav',
  'ogg',
  'flac',
  'aac',
  'm4a',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
  'zip',
  'tar',
  'gz',
  'bz2',
  'xz',
  '7z',
  'rar',
  'ttf',
  'otf',
  'woff',
  'woff2',
  'eot',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'exe',
  'dll',
  'so',
  'dylib',
  'bin',
  'psd',
  'ai'
]);

const isBinaryPath = (path: string): boolean => {
  const ext = path.split('.').pop();
  if (!ext) {
    return false;
  }
  return BINARY_EXTENSIONS.has(ext.toLowerCase());
};

const LINE_NUMBER_CLASS =
  'text-muted-foreground w-12 shrink-0 select-none border-r border-border/40 px-2 py-0.5 text-right tabular-nums';
const LINE_CONTENT_CLASS = 'whitespace-pre px-3 py-0.5';

const lineClasses = (type: DiffLine['type']): string => {
  if (type === 'add') {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
  }
  if (type === 'del') {
    return 'bg-rose-500/15 text-rose-700 dark:text-rose-300';
  }
  return 'text-foreground/90';
};

const formatRange = (range: string | undefined): string | null => {
  if (!range) {
    return null;
  }
  return range.trim().length > 0 ? range : null;
};

type HeaderProps = {
  range: string | undefined;
  file: string | undefined;
};

const Header: FC<HeaderProps> = ({ range, file }) => (
  <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs">
    <span className="text-muted-foreground truncate font-mono">
      {file ?? 'All files'}
    </span>
    {range && (
      <span className="text-muted-foreground shrink-0 font-mono">
        range: {range}
      </span>
    )}
  </header>
);

type LineRowProps = {
  line: DiffLine;
};

const LineRow: FC<LineRowProps> = ({ line }) => {
  const lineNumber = line.oldLine ?? line.newLine ?? '';
  return (
    <div className={cn('flex font-mono text-xs leading-5', lineClasses(line.type))}>
      <div className={LINE_NUMBER_CLASS}>{lineNumber}</div>
      <pre className={cn(LINE_CONTENT_CLASS, 'm-0 flex-1')}>
        <span className="select-none opacity-60">
          {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
        </span>
        {line.content || ' '}
      </pre>
    </div>
  );
};

type HunkProps = {
  hunk: DiffHunk;
};

const Hunk: FC<HunkProps> = ({ hunk }) => (
  <section className="flex flex-col border-b border-border/40 last:border-b-0">
    <div className="bg-muted/60 text-foreground/80 flex items-center gap-2 px-3 py-1.5 font-mono text-[11px]">
      <FileText aria-hidden="true" className="text-muted-foreground size-3.5" />
      <span className="truncate">{hunk.filePath}</span>
      <span className="text-muted-foreground ml-auto shrink-0 tabular-nums">
        -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines}
      </span>
    </div>
    {hunk.lines.map((line, index) => (
      <LineRow key={`${index}-${line.type}`} line={line} />
    ))}
  </section>
);

export const DiffViewer: FC<DiffViewerProps> = ({
  repoPath,
  range,
  file,
  className
}) => {
  const input = repoPath ? { repoPath, range, file } : null;
  const { data, isLoading, isError, error } = useDiff(input);
  const formattedRange = formatRange(range);
  const hunks = data ?? [];

  if (file && isBinaryPath(file)) {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <Header range={formattedRange ?? undefined} file={file} />
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty
            icon={<ScanLine aria-hidden="true" className="size-6" />}
            title={BINARY_FILE_TITLE}
            description={BINARY_FILE_DESCRIPTION}
            className="w-full max-w-md"
          />
        </div>
        {error && (
          <span className="sr-only" role="alert">
            {error.message}
          </span>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn('flex h-full flex-col', className)}
        aria-busy="true"
      >
        <Header range={formattedRange ?? undefined} file={file} />
        <div className="flex flex-1 items-center justify-center">
          <Spinner label={LOADING_LABEL} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <Header range={formattedRange ?? undefined} file={file} />
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty
            icon={<ScanLine aria-hidden="true" className="size-6" />}
            title={ERROR_TITLE}
            description={error?.message ?? EMPTY_DESCRIPTION}
            className="w-full max-w-md"
          />
        </div>
      </div>
    );
  }

  if (hunks.length === 0) {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <Header range={formattedRange ?? undefined} file={file} />
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty
            title={EMPTY_TITLE}
            description={EMPTY_DESCRIPTION}
            className="w-full max-w-md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <Header range={formattedRange ?? undefined} file={file} />
      <div
        className="bg-background flex-1 overflow-auto"
        role="region"
        aria-label="Unified diff"
      >
        {hunks.map((hunk, index) => (
          <Hunk key={`${hunk.filePath}-${index}`} hunk={hunk} />
        ))}
      </div>
    </div>
  );
};
