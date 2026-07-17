import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  TableBodyProps,
  TableCellProps,
  TableHeadProps,
  TableHeaderProps,
  TableProps,
  TableRowProps
} from './types';

const Table: FC<TableProps> = ({ className, ...rest }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn('w-full caption-bottom text-sm', className)}
      {...rest}
    />
  </div>
);

const TableHeader: FC<TableHeaderProps> = ({ className, ...rest }) => (
  <thead className={cn('[&_tr]:border-b', className)} {...rest} />
);

const TableBody: FC<TableBodyProps> = ({ className, ...rest }) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...rest} />
);

const TableRow: FC<TableRowProps> = ({ className, ...rest }) => (
  <tr
    className={cn(
      'border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...rest}
  />
);

const TableHead: FC<TableHeadProps> = ({ className, ...rest }) => (
  <th
    className={cn(
      'text-foreground h-10 px-3 text-left align-middle font-medium',
      className
    )}
    {...rest}
  />
);

const TableCell: FC<TableCellProps> = ({ className, ...rest }) => (
  <td className={cn('p-3 align-middle', className)} {...rest} />
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
