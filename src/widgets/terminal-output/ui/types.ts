export type TerminalLineKind = 'stderr' | 'stdout' | 'info';

export type TerminalLine = {
  id?: string;
  kind: TerminalLineKind;
  text: string;
};

export type TerminalOutputProps = {
  lines: TerminalLine[];
  maxLines?: number;
  className?: string;
};
