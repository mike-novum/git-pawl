import { X } from 'lucide-react';
import { useEffect, type FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { DrawerProps } from './types';

const DEFAULT_WIDTH = 480;

export const Drawer: FC<DrawerProps> = ({
  open,
  onOpenChange,
  title,
  description,
  width = DEFAULT_WIDTH,
  children,
  footer
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        data-testid="drawer-backdrop"
        className="bg-overlay absolute inset-0 backdrop-blur-sm animate-[fadeIn_180ms_var(--ease-out)]"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'bg-surface text-foreground relative flex h-full flex-col border-l shadow-sm',
          'animate-[slideInRight_180ms_var(--ease-out)]'
        )}
        style={{ width }}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex flex-col gap-1">
            {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
            {description ? (
              <p className="text-muted-foreground text-sm">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-5">{children}</div>
        {footer ? (
          <footer className="flex shrink-0 justify-end gap-2 border-t border-border p-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
};

Drawer.displayName = 'Drawer';
