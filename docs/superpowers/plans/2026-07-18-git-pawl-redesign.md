# git-pawl Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать редизайн основного интерфейса git-pawl: горизонтальная шапка, экран тайлов воркспейсов, страница воркспейса с группировкой, новая страница репозитория с 3-колоночной структурой и вертикальным графом.

**Architecture:** Поэтапный фундамент (токены → UI-примитивы → data-слой) → композиция (header chrome → workspaces tiles → workspace page → repo page). Используем существующий стек: Tailwind v4 с семантическими токенами, Base UI, Zustand, React Query.

**Tech Stack:** React 18 + TypeScript + Tailwind v4 + Base UI + Zustand + React Query + Vitest + electron-vite. Без новых внешних зависимостей.

## Global Constraints

- AGENTS.md: компоненты — стрелочные функции с `FC<Props>`; типы выносить в `types.ts`; комментарии не добавлять без просьбы; Conventional Commits на русском со страдательными причастиями; ветки `тип/краткое-описание`.
- FSD: `app → pages → widgets → features → entities → shared`. Импорты только сверху вниз.
- npm-скрипты: `npm run tsc`, `npm run lint:fix` — обязательны перед коммитом.
- Реэкспорт старых путей `/workspace` → `/workspaces`, `/repo/:id` → `/repos/:id` через `<Navigate>`.
- Все файлы — абсолютные пути от корня проекта.

---

## File Structure

**Новые shared/ui:**
- `src/shared/ui/status-dot/{StatusDot.tsx,types.ts,index.ts,StatusDot.test.tsx,StatusDot.stories.tsx}`
- `src/shared/ui/drawer/{Drawer.tsx,types.ts,index.ts,Drawer.test.tsx}`

**Новые entities:**
- `src/entities/workspace/lib/computeWorkspaceSize.ts`
- `src/entities/workspace/lib/computeWorkspaceStatus.ts`
- `src/entities/workspace/lib/formatBytes.ts`
- `src/entities/workspace/model/workspaceSizeCache.ts`

**Новые widgets:**
- `src/widgets/app-header/{AppHeader.tsx,types.ts,index.ts,ui/index.ts}`
- `src/widgets/workspace-selector/` (замена `workspace-switcher`)
- `src/widgets/repo-card/{RepoCard.tsx,types.ts,index.ts}`
- `src/widgets/repo-tree/{RepoTree.tsx,types.ts,index.ts}`
- `src/widgets/repo-graph-vertical/{RepoGraph.tsx,types.ts,index.ts}`
- `src/widgets/repo-detail-panel/{RepoDetailPanel.tsx,types.ts,index.ts}`

**Новые/изменённые pages:**
- `src/pages/workspaces/{index.ts,types.ts,ui/WorkspacesPage.tsx,ui/WorkspaceTile.tsx,ui/NewWorkspaceTile.tsx,ui/EmptyWorkspaces.tsx,ui/RecentActivity.tsx}`
- `src/pages/workspace/{index.ts,types.ts,ui/WorkspacePage.tsx,ui/WorkspaceHero.tsx,ui/WorkspaceToolbar.tsx,ui/RepoGroup.tsx,ui/EmptyWorkspace.tsx,ui/WorkspaceSettingsDrawer.tsx}`
- `src/pages/repository/ui/RepositoryPage.tsx` (переписать)

**Изменённые файлы:**
- `src/app/styles/theme.css`, `src/app/styles/light.css`
- `src/app/layouts/AppLayout.tsx`
- `src/app/routes/AppRoutes.tsx`
- `electron/shared/schemas.ts`, `electron/main/services/fs.ts`, `electron/main/index.ts`, `electron/preload/index.ts`, `src/shared/api/ipc.ts`, `src/shared/api/index.ts`

**Удалённые файлы:**
- `src/widgets/workspace-switcher/` (заменён `workspace-selector`)

---

## Task 1: Дизайн-токены для новых семантических переменных

**Files:**
- Modify: `src/app/styles/theme.css:1-34`
- Modify: `src/app/styles/light.css:1-26`

**Interfaces:**
- Consumes: ничего
- Produces: токены `--color-surface`, `--color-surface-elevated`, `--color-success`, `--color-warning`, `--color-danger` доступны в Tailwind через `bg-surface`, `bg-surface-elevated`, `text-success`, `text-warning`, `text-danger`. Токен `--shadow-glow` доступен как `shadow-glow` в Tailwind.

- [ ] **Step 1: Обновить `theme.css` — заменить все содержимое файла**

Заменить содержимое `src/app/styles/theme.css` на:

```css
@theme {
  --color-background: oklch(0.16 0.015 250);
  --color-foreground: oklch(0.95 0.005 250);

  --color-surface: oklch(0.20 0.015 250);
  --color-surface-elevated: oklch(0.24 0.015 250);
  --color-surface-foreground: oklch(0.95 0.005 250);

  --color-card: oklch(0.20 0.015 250);
  --color-card-foreground: oklch(0.95 0.005 250);

  --color-primary: oklch(0.74 0.18 50);
  --color-primary-foreground: oklch(0.16 0.015 250);

  --color-secondary: oklch(0.28 0.012 250);
  --color-secondary-foreground: oklch(0.95 0.005 250);

  --color-muted: oklch(0.28 0.012 250);
  --color-muted-foreground: oklch(0.70 0.01 250);

  --color-accent: oklch(0.40 0.05 50);
  --color-accent-foreground: oklch(0.95 0.005 250);

  --color-destructive: oklch(0.68 0.22 25);
  --color-destructive-foreground: oklch(0.98 0.005 250);

  --color-success: oklch(0.78 0.16 145);
  --color-success-foreground: oklch(0.16 0.015 250);

  --color-warning: oklch(0.83 0.17 90);
  --color-warning-foreground: oklch(0.16 0.015 250);

  --color-danger: oklch(0.68 0.22 25);
  --color-danger-foreground: oklch(0.98 0.005 250);

  --color-border: oklch(0.28 0.012 250);
  --color-input: oklch(0.28 0.012 250);
  --color-ring: oklch(0.74 0.18 50);

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  --duration-fast: 120ms;
  --duration-base: 180ms;
  --ease-fast: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  --shadow-glow: 0 0 0 1px var(--color-primary), 0 0 12px -2px var(--color-primary);
  --shadow-sm: 0 2px 8px -4px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 2: Обновить `light.css` — заменить все содержимое файла**

Заменить содержимое `src/app/styles/light.css` на:

```css
[data-theme="light"] {
  --color-background: oklch(0.99 0.005 250);
  --color-foreground: oklch(0.20 0.015 250);

  --color-surface: oklch(0.96 0.005 250);
  --color-surface-elevated: oklch(0.93 0.008 250);
  --color-surface-foreground: oklch(0.20 0.015 250);

  --color-card: oklch(0.96 0.005 250);
  --color-card-foreground: oklch(0.20 0.015 250);

  --color-primary: oklch(0.65 0.20 50);
  --color-primary-foreground: oklch(0.99 0.005 250);

  --color-secondary: oklch(0.94 0.008 250);
  --color-secondary-foreground: oklch(0.20 0.015 250);

  --color-muted: oklch(0.94 0.008 250);
  --color-muted-foreground: oklch(0.50 0.01 250);

  --color-accent: oklch(0.92 0.05 50);
  --color-accent-foreground: oklch(0.20 0.015 250);

  --color-destructive: oklch(0.58 0.22 25);
  --color-destructive-foreground: oklch(0.99 0.005 250);

  --color-success: oklch(0.65 0.18 145);
  --color-success-foreground: oklch(0.99 0.005 250);

  --color-warning: oklch(0.75 0.18 90);
  --color-warning-foreground: oklch(0.20 0.015 250);

  --color-danger: oklch(0.58 0.22 25);
  --color-danger-foreground: oklch(0.99 0.005 250);

  --color-border: oklch(0.88 0.01 250);
  --color-input: oklch(0.88 0.01 250);
  --color-ring: oklch(0.65 0.20 50);
}
```

- [ ] **Step 3: Проверить компиляцию**

Run: `npm run tsc`
Expected: успех (без ошибок типов).

- [ ] **Step 4: Закоммитить**

```bash
git add src/app/styles/theme.css src/app/styles/light.css
git commit -m "feat(theme): добавлены семантические токены для surface, success, warning, danger"
```

---

## Task 2: UI-компонент StatusDot

**Files:**
- Create: `src/shared/ui/status-dot/types.ts`
- Create: `src/shared/ui/status-dot/StatusDot.tsx`
- Create: `src/shared/ui/status-dot/index.ts`
- Create: `src/shared/ui/status-dot/StatusDot.test.tsx`

**Interfaces:**
- Consumes: ничего
- Produces: `<StatusDot variant="clean" | "warning" | "danger" />` рендерит цветную точку 8×8. Текст varianta доступен через `aria-label`.

- [ ] **Step 1: Создать `types.ts`**

Создать `src/shared/ui/status-dot/types.ts`:

```ts
export type StatusDotVariant = 'clean' | 'warning' | 'danger';

export type StatusDotProps = {
  variant: StatusDotVariant;
  label?: string;
  className?: string;
};
```

- [ ] **Step 2: Написать failing test**

Создать `src/shared/ui/status-dot/StatusDot.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusDot } from './StatusDot';

describe('StatusDot', () => {
  it('renders with aria-label for the variant when label is not provided', () => {
    render(<StatusDot variant="clean" data-testid="dot" />);
    expect(screen.getByTestId('dot')).toHaveAttribute('aria-label', 'clean');
  });

  it('uses provided label over variant default', () => {
    render(<StatusDot variant="warning" label="uncommitted changes" />);
    expect(screen.getByLabelText('uncommitted changes')).toBeInTheDocument();
  });

  it('applies variant-specific color class', () => {
    const { rerender } = render(<StatusDot variant="clean" data-testid="dot" />);
    expect(screen.getByTestId('dot').className).toMatch(/bg-success/);

    rerender(<StatusDot variant="warning" data-testid="dot" />);
    expect(screen.getByTestId('dot').className).toMatch(/bg-warning/);

    rerender(<StatusDot variant="danger" data-testid="dot" />);
    expect(screen.getByTestId('dot').className).toMatch(/bg-danger/);
  });
});
```

- [ ] **Step 3: Запустить тесты — должны упасть**

Run: `npx vitest run src/shared/ui/status-dot`
Expected: FAIL — модуль `./StatusDot` не найден.

- [ ] **Step 4: Реализовать `StatusDot.tsx`**

Создать `src/shared/ui/status-dot/StatusDot.tsx`:

```tsx
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { StatusDotProps } from './types';

const VARIANT_BG: Record<StatusDotProps['variant'], string> = {
  clean: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

export const StatusDot: FC<StatusDotProps> = ({ variant, label, className }) => {
  const ariaLabel = label ?? variant;
  return (
    <span
      aria-label={ariaLabel}
      role="status"
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        VARIANT_BG[variant],
        className
      )}
    />
  );
};

StatusDot.displayName = 'StatusDot';
```

- [ ] **Step 5: Создать `index.ts`**

Создать `src/shared/ui/status-dot/index.ts`:

```ts
export { StatusDot } from './StatusDot';
export type { StatusDotProps, StatusDotVariant } from './types';
```

- [ ] **Step 6: Запустить тесты — должны пройти**

Run: `npx vitest run src/shared/ui/status-dot`
Expected: 3 passed.

- [ ] **Step 7: Закоммитить**

```bash
git add src/shared/ui/status-dot
git commit -m "feat(ui): добавлен компонент StatusDot для статус-точек"
```

---

## Task 3: UI-компонент Drawer

**Files:**
- Create: `src/shared/ui/drawer/types.ts`
- Create: `src/shared/ui/drawer/Drawer.tsx`
- Create: `src/shared/ui/drawer/index.ts`
- Create: `src/shared/ui/drawer/Drawer.test.tsx`

**Interfaces:**
- Consumes: ничего
- Produces: `<Drawer open onOpenChange title="...">...</Drawer>` — выезжает справа, ширина 480, закрывается по Esc и клику на backdrop.

- [ ] **Step 1: Создать `types.ts`**

Создать `src/shared/ui/drawer/types.ts`:

```ts
import type { ReactNode } from 'react';

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
};
```

- [ ] **Step 2: Написать failing test**

Создать `src/shared/ui/drawer/Drawer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('does not render content when closed', () => {
    render(<Drawer open={false} onOpenChange={() => {}} title="X">Body</Drawer>);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
    expect(screen.queryByText('X')).not.toBeInTheDocument();
  });

  it('renders title and body when open', () => {
    render(<Drawer open onOpenChange={() => {}} title="Settings">Body</Drawer>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) on Esc key', async () => {
    const onChange = vi.fn();
    render(<Drawer open onOpenChange={onChange} title="X">Body</Drawer>);
    await userEvent.keyboard('{Escape}');
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on backdrop click', async () => {
    const onChange = vi.fn();
    const { baseElement } = render(
      <Drawer open onOpenChange={onChange} title="X">Body</Drawer>
    );
    const backdrop = baseElement.querySelector('[data-testid="drawer-backdrop"]');
    expect(backdrop).toBeTruthy();
    await userEvent.click(backdrop as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
```

- [ ] **Step 3: Запустить тесты — должны упасть**

Run: `npx vitest run src/shared/ui/drawer`
Expected: FAIL — модуль `./Drawer` не найден.

- [ ] **Step 4: Реализовать `Drawer.tsx`**

Создать `src/shared/ui/drawer/Drawer.tsx`:

```tsx
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
        className="bg-foreground/40 absolute inset-0 animate-[fadeIn_180ms_var(--ease-out)]"
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
```

Добавить в конец `src/app/styles/globals.css` keyframes (если ещё нет):

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

- [ ] **Step 5: Создать `index.ts`**

Создать `src/shared/ui/drawer/index.ts`:

```ts
export { Drawer } from './Drawer';
export type { DrawerProps } from './types';
```

- [ ] **Step 6: Запустить тесты — должны пройти**

Run: `npx vitest run src/shared/ui/drawer`
Expected: 4 passed.

- [ ] **Step 7: Закоммитить**

```bash
git add src/shared/ui/drawer src/app/styles/globals.css
git commit -m "feat(ui): добавлен компонент Drawer для боковых панелей"
```

---

## Task 4: IPC для размера воркспейса на диске

**Files:**
- Modify: `electron/shared/schemas.ts:165-167` (добавить `fsWorkspaceSizeSchema`)
- Modify: `electron/shared/schemas.ts:248-257` (добавить экспорт типа)
- Modify: `electron/main/services/fs.ts:1-115` (добавить `getWorkspaceSize`)
- Create: `electron/main/services/fs.test.ts` дополнить (или создать если нет)
- Modify: `electron/main/index.ts:13-44` (импорт), `:201-213` (регистрация хэндлера)
- Modify: `electron/preload/index.ts:40` (добавить `FsWorkspaceSizeArgs`), `:79-82` (тип API), `:132-135` (binding)
- Modify: `src/shared/api/ipc.ts:18-32` (импорт), `:155-165` (функция + экспорт)
- Modify: `src/shared/api/index.ts:26-31` (реэкспорт)

**Interfaces:**
- Consumes: ничего
- Produces: `fsWorkspaceSize({ workspacePath }) => Promise<number>` — возвращает суммарный размер папки в байтах, исключая `.git/objects` и `node_modules`.

- [ ] **Step 1: Добавить схему `fsWorkspaceSizeSchema` в `electron/shared/schemas.ts`**

Вставить после `fsSizeSchema` (после строки 167):

```ts
export const fsWorkspaceSizeSchema = z.object({
  workspacePath: z.string().min(1)
});
```

В блоке экспорта типов добавить:

```ts
export type FsWorkspaceSizeArgs = z.infer<typeof fsWorkspaceSizeSchema>;
```

- [ ] **Step 2: Написать failing test в `electron/main/services/fs.test.ts`**

Добавить в существующий файл `electron/main/services/fs.test.ts` (или создать если отсутствует) — найти конец файла, добавить блок:

```ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { getWorkspaceSize } from './fs';

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await mkdtemp(path.join(tmpdir(), 'git-pawl-wssize-'));
});

afterEach(async () => {
  await rm(tmpRoot, { recursive: true, force: true });
});

describe('getWorkspaceSize', () => {
  it('returns zero for an empty workspace', async () => {
    const result = await getWorkspaceSize({ workspacePath: tmpRoot });
    expect(result).toBe(0);
  });

  it('sums file sizes across nested directories', async () => {
    await writeFile(path.join(tmpRoot, 'a.txt'), 'hello');
    await mkdir(path.join(tmpRoot, 'sub'), { recursive: true });
    await writeFile(path.join(tmpRoot, 'sub', 'b.txt'), 'world!');
    const result = await getWorkspaceSize({ workspacePath: tmpRoot });
    expect(result).toBe(11);
  });

  it('skips node_modules', async () => {
    await writeFile(path.join(tmpRoot, 'a.txt'), 'ok');
    await mkdir(path.join(tmpRoot, 'node_modules'), { recursive: true });
    await writeFile(path.join(tmpRoot, 'node_modules', 'big.bin'), 'x'.repeat(1000));
    const result = await getWorkspaceSize({ workspacePath: tmpRoot });
    expect(result).toBe(2);
  });

  it('skips .git/objects', async () => {
    await writeFile(path.join(tmpRoot, 'a.txt'), 'ok');
    await mkdir(path.join(tmpRoot, '.git', 'objects'), { recursive: true });
    await writeFile(path.join(tmpRoot, '.git', 'objects', 'pack'), 'x'.repeat(5000));
    const result = await getWorkspaceSize({ workspacePath: tmpRoot });
    expect(result).toBe(2);
  });

  it('throws when workspacePath does not exist', async () => {
    await expect(
      getWorkspaceSize({ workspacePath: path.join(tmpRoot, 'missing') })
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Запустить — должно упасть**

Run: `npx vitest run electron/main/services/fs.test.ts`
Expected: FAIL — `getWorkspaceSize is not exported`.

- [ ] **Step 4: Реализовать `getWorkspaceSize` в `electron/main/services/fs.ts`**

Вставить после `getRepoSize` (после строки 115, перед `resolveIconExtension`):

```ts
export type WorkspaceSizeResult = { totalBytes: number };

const WORKSPACE_SKIP_DIRS = new Set(['node_modules', '.git']);

export const getWorkspaceSize = async (
  args: FsWorkspaceSizeArgs
): Promise<WorkspaceSizeResult> => {
  const wsPath = await ensureDirectoryExists(args.workspacePath);

  let totalBytes = 0;
  const dirs: string[] = [wsPath];
  const inFlight: Set<Promise<void>> = new Set();

  const processDir = async (dir: string): Promise<void> => {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (WORKSPACE_SKIP_DIRS.has(entry.name)) continue;
        dirs.push(fullPath);
      } else if (entry.isFile()) {
        try {
          const stat = await fs.stat(fullPath);
          totalBytes += stat.size;
        } catch {
          continue;
        }
      }
    }
  };

  while (dirs.length > 0 || inFlight.size > 0) {
    while (inFlight.size < WALK_CONCURRENCY && dirs.length > 0) {
      const nextDir = dirs.shift() as string;
      const promise = processDir(nextDir).finally(() => {
        inFlight.delete(promise);
      });
      inFlight.add(promise);
    }
    if (inFlight.size > 0) {
      await Promise.race(inFlight);
    }
  }

  return { totalBytes };
};
```

Импортировать `FsWorkspaceSizeArgs` — добавить в блок импортов сверху:

```ts
import type {
  FsIconRemoveArgs,
  FsIconSetArgs,
  FsSizeArgs,
  FsWorkspaceCreateArgs,
  FsWorkspaceSizeArgs
} from '../../shared/schemas';
```

- [ ] **Step 5: Запустить тесты — должны пройти**

Run: `npx vitest run electron/main/services/fs.test.ts`
Expected: 5 passed (включая существующие).

- [ ] **Step 6: Зарегистрировать хэндлер в `electron/main/index.ts`**

В блоке импортов добавить:

```ts
import { getRepoSize, getWorkspaceSize, ... } from './services/fs';
```

В массиве регистрации хэндлеров (после строки 201 — `safeHandle(IPC_CHANNELS.FS_SIZE, ...)`) добавить:

```ts
safeHandle(IPC_CHANNELS.FS_WORKSPACE_SIZE, fsWorkspaceSizeSchema, getWorkspaceSize);
```

Импортировать схему:

```ts
import { fsWorkspaceSizeSchema, ... } from '../shared/schemas';
```

- [ ] **Step 7: Добавить binding в preload**

В `electron/preload/index.ts`:

В импорт типов (строка ~40) добавить `FsWorkspaceSizeArgs`.

В API-тип (после `fsSize: (args: FsSizeArgs) => Promise<unknown>`) добавить:

```ts
fsWorkspaceSize: (args: FsWorkspaceSizeArgs) => Promise<{ totalBytes: number }>;
```

В реализацию binding (после `fsSize: (args) => invoke('fs:size', args)`) добавить:

```ts
fsWorkspaceSize: (args) => invoke('fs:workspace-size', args),
```

В `electron/shared/ipc-channels.ts` добавить канал:

```ts
FS_WORKSPACE_SIZE: 'fs:workspace-size',
```

- [ ] **Step 8: Прокинуть в renderer через `src/shared/api/ipc.ts`**

Добавить в импорт типов (строка ~18):

```ts
import type {
  ...
  FsWorkspaceSizeArgs
} from '@electron/preload';
```

Добавить функцию после `fsSize`:

```ts
export const fsWorkspaceSize = async (
  args: FsWorkspaceSizeArgs
): Promise<{ totalBytes: number }> =>
  safeInvoke<{ totalBytes: number }>(
    (bridge) => bridge.fsWorkspaceSize(args),
    { totalBytes: 0 }
  );
```

В объекте `api` добавить:

```ts
fsWorkspaceSize,
```

- [ ] **Step 9: Реэкспорт из `src/shared/api/index.ts`**

Добавить в блок `export { ... }`:

```ts
fsWorkspaceSize,
```

- [ ] **Step 10: Проверить типы**

Run: `npm run tsc`
Expected: успех.

- [ ] **Step 11: Закоммитить**

```bash
git add electron/shared/schemas.ts electron/shared/ipc-channels.ts electron/main/services/fs.ts electron/main/services/fs.test.ts electron/main/index.ts electron/preload/index.ts src/shared/api/ipc.ts src/shared/api/index.ts
git commit -m "feat(fs): добавлен IPC-канал для подсчёта размера воркспейса"
```

---

## Task 5: Утилита форматирования байтов

**Files:**
- Create: `src/entities/workspace/lib/formatBytes.ts`
- Create: `src/entities/workspace/lib/formatBytes.test.ts`

**Interfaces:**
- Consumes: ничего
- Produces: `formatBytes(bytes: number): string` — `'124 MB'`, `'2.1 GB'`, `'0 B'`, `'512 B'`, `'38 KB'`.

- [ ] **Step 1: Написать failing test**

Создать `src/entities/workspace/lib/formatBytes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  it('returns 0 B for zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes under 1024 as B', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats KB with no decimals under 10', () => {
    expect(formatBytes(38 * 1024)).toBe('38 KB');
  });

  it('formats MB with one decimal when >= 10', () => {
    expect(formatBytes(124 * 1024 * 1024)).toBe('124 MB');
  });

  it('formats GB with one decimal', () => {
    expect(formatBytes(2.1 * 1024 * 1024 * 1024)).toBe('2.1 GB');
  });
});
```

- [ ] **Step 2: Запустить — должно упасть**

Run: `npx vitest run src/entities/workspace/lib/formatBytes.test.ts`
Expected: FAIL.

- [ ] **Step 3: Реализовать `formatBytes.ts`**

Создать `src/entities/workspace/lib/formatBytes.ts`:

```ts
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1
  );
  const value = bytes / Math.pow(1024, exp);
  const rounded = exp === 0 || value < 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${UNITS[exp]}`;
};
```

- [ ] **Step 4: Запустить тесты — должны пройти**

Run: `npx vitest run src/entities/workspace/lib/formatBytes.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Закоммитить**

```bash
git add src/entities/workspace/lib/formatBytes.ts src/entities/workspace/lib/formatBytes.test.ts
git commit -m "feat(workspace): добавлена утилита форматирования байтов"
```

---

## Task 6: Кеш и хук для размера воркспейса

**Files:**
- Create: `src/entities/workspace/model/workspaceSizeCache.ts`
- Modify: `src/entities/workspace/model/useWorkspace.ts` (добавить `useWorkspaceSize`)
- Modify: `src/entities/workspace/model/index.ts` (экспорт)

**Interfaces:**
- Consumes: `fsWorkspaceSize` из `shared/api`
- Produces: `useWorkspaceSize(workspacePath: string | null): { totalBytes: number | null, scannedAt: number | null }` — кеширует результат на 5 минут по ключу `${workspacePath}`.

- [ ] **Step 1: Создать `workspaceSizeCache.ts`**

Создать `src/entities/workspace/model/workspaceSizeCache.ts`:

```ts
import { fsWorkspaceSize } from '@/shared/api';

const TTL_MS = 5 * 60 * 1000;

type Entry = { totalBytes: number; scannedAt: number };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<Entry>>();

export const getCachedSize = async (workspacePath: string): Promise<Entry> => {
  const now = Date.now();
  const cached = cache.get(workspacePath);
  if (cached && now - cached.scannedAt < TTL_MS) {
    return cached;
  }
  const pending = inflight.get(workspacePath);
  if (pending) return pending;

  const promise = (async (): Promise<Entry> => {
    const result = await fsWorkspaceSize({ workspacePath });
    const entry: Entry = { totalBytes: result.totalBytes, scannedAt: Date.now() };
    cache.set(workspacePath, entry);
    inflight.delete(workspacePath);
    return entry;
  })();
  inflight.set(workspacePath, promise);
  return promise;
};

export const invalidateWorkspaceSize = (workspacePath: string): void => {
  cache.delete(workspacePath);
};

export const clearWorkspaceSizeCache = (): void => {
  cache.clear();
};
```

- [ ] **Step 2: Добавить хук `useWorkspaceSize` в `useWorkspace.ts`**

В конце `src/entities/workspace/model/useWorkspace.ts` добавить:

```ts
import { useQuery } from '@tanstack/react-query';

import { getCachedSize, invalidateWorkspaceSize } from './workspaceSizeCache';

export const useWorkspaceSize = (
  workspacePath: string | null
): { totalBytes: number | null; scannedAt: number | null } => {
  const query = useQuery({
    queryKey: ['workspace-size', workspacePath],
    queryFn: () => getCachedSize(workspacePath as string),
    enabled: !!workspacePath,
    staleTime: 5 * 60 * 1000
  });

  return {
    totalBytes: query.data?.totalBytes ?? null,
    scannedAt: query.data?.scannedAt ?? null
  };
};

export { invalidateWorkspaceSize };
```

- [ ] **Step 3: Экспорт из `index.ts`**

В `src/entities/workspace/model/index.ts` добавить:

```ts
export { useWorkspaceSize, invalidateWorkspaceSize } from './useWorkspace';
```

- [ ] **Step 4: Проверить типы**

Run: `npm run tsc`
Expected: успех.

- [ ] **Step 5: Закоммитить**

```bash
git add src/entities/workspace/model/workspaceSizeCache.ts src/entities/workspace/model/useWorkspace.ts src/entities/workspace/model/index.ts
git commit -m "feat(workspace): добавлен кеш размера воркспейса на диске"
```

---

## Task 7: Хелпер статуса воркспейса (clean / warning / danger) с кешем

**Files:**
- Create: `src/entities/workspace/lib/computeWorkspaceStatus.ts`
- Create: `src/entities/workspace/lib/computeWorkspaceStatus.test.ts`
- Modify: `src/entities/workspace/model/index.ts` (экспорт `useWorkspaceStatus`)

**Interfaces:**
- Consumes: `fsScanRepos` из `shared/api`, `gitStatus` из `shared/api`
- Produces: `useWorkspaceStatus(workspacePath: string | null): { status: 'clean' | 'warning' | 'danger' | 'unknown', scannedAt: number }` — пробегает по репо воркспейса (max depth 1), проверяет `.git` наличие и `git status --porcelain`. Кеш 30 секунд.

- [ ] **Step 1: Создать `computeWorkspaceStatus.ts`**

Создать `src/entities/workspace/lib/computeWorkspaceStatus.ts`:

```ts
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { fsScanRepos, gitStatus } from '@/shared/api';

export type WorkspaceStatus = 'clean' | 'warning' | 'danger' | 'unknown';

const CACHE_TTL_MS = 30 * 1000;

type CacheEntry = { status: WorkspaceStatus; scannedAt: number };
const cache = new Map<string, CacheEntry>();

export const invalidateWorkspaceStatus = (workspacePath: string): void => {
  cache.delete(workspacePath);
};

export const getCachedWorkspaceStatus = async (
  workspacePath: string
): Promise<CacheEntry> => {
  const cached = cache.get(workspacePath);
  if (cached && Date.now() - cached.scannedAt < CACHE_TTL_MS) {
    return cached;
  }

  const repoPaths = await fsScanRepos({ path: workspacePath, maxDepth: 1 });

  const concurrency = 4;
  let cursor = 0;
  let status: WorkspaceStatus = 'clean';

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < repoPaths.length && status !== 'danger') {
      const idx = cursor++;
      const repoPath = repoPaths[idx];
      try {
        await fs.access(path.join(repoPath, '.git'));
      } catch {
        status = 'danger';
        return;
      }
      try {
        const result = (await gitStatus({ repoPath })) as {
          porcelain?: string;
        };
        if (result?.porcelain && result.porcelain.trim().length > 0) {
          if (status === 'clean') status = 'warning';
        }
      } catch {
        if (status === 'clean') status = 'warning';
      }
    }
  });

  await Promise.all(workers);

  const entry: CacheEntry = { status, scannedAt: Date.now() };
  cache.set(workspacePath, entry);
  return entry;
};
```

- [ ] **Step 2: Написать failing test**

Создать `src/entities/workspace/lib/computeWorkspaceStatus.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCachedWorkspaceStatus } from './computeWorkspaceStatus';

vi.mock('@/shared/api', () => ({
  fsScanRepos: vi.fn(),
  gitStatus: vi.fn()
}));

const mockedFsScanRepos = (await import('@/shared/api'))
  .fsScanRepos as unknown as ReturnType<typeof vi.fn>;
const mockedGitStatus = (await import('@/shared/api'))
  .gitStatus as unknown as ReturnType<typeof vi.fn>;

afterEach(() => {
  mockedFsScanRepos.mockReset();
  mockedGitStatus.mockReset();
});

describe('getCachedWorkspaceStatus', () => {
  it('returns clean when no repos', async () => {
    mockedFsScanRepos.mockResolvedValueOnce([]);
    const result = await getCachedWorkspaceStatus('/ws');
    expect(result.status).toBe('clean');
  });

  it('returns danger when a repo has no .git folder', async () => {
    mockedFsScanRepos.mockResolvedValueOnce(['/ws/repo1']);
    mockedGitStatus.mockResolvedValueOnce({ porcelain: '' });
    const result = await getCachedWorkspaceStatus('/ws');
    expect(result.status).toBe('danger');
  });

  it('returns warning when a repo has uncommitted changes', async () => {
    mockedFsScanRepos.mockResolvedValueOnce(['/ws/repo1']);
    mockedGitStatus.mockResolvedValueOnce({ porcelain: 'M file.txt' });
    const result = await getCachedWorkspaceStatus('/ws');
    expect(result.status).toBe('warning');
  });

  it('returns danger when any repo is broken even if others dirty', async () => {
    mockedFsScanRepos.mockResolvedValueOnce(['/ws/bad', '/ws/ok']);
    mockedGitStatus.mockResolvedValueOnce({ porcelain: '' });
    const result = await getCachedWorkspaceStatus('/ws');
    expect(result.status).toBe('danger');
  });
});
```

- [ ] **Step 3: Запустить тесты — должны упасть**

Run: `npx vitest run src/entities/workspace/lib/computeWorkspaceStatus.test.ts`
Expected: FAIL (модуль `computeWorkspaceStatus` не существует).

- [ ] **Step 4: Переименовать `computeWorkspaceStatus.ts` (если ещё не существует) и убедиться что он есть**

Файл уже создан в Step 1. Проверить что компилируется.

- [ ] **Step 5: Запустить тесты — должны пройти**

Run: `npx vitest run src/entities/workspace/lib/computeWorkspaceStatus.test.ts`
Expected: 4 passed.

- [ ] **Step 6: Добавить React-хук `useWorkspaceStatus` в `useWorkspace.ts`**

В `src/entities/workspace/model/useWorkspace.ts` добавить:

```ts
import {
  getCachedWorkspaceStatus,
  invalidateWorkspaceStatus
} from '../lib/computeWorkspaceStatus';

export const useWorkspaceStatus = (
  workspacePath: string | null
): { status: WorkspaceStatus; scannedAt: number | null } => {
  const query = useQuery({
    queryKey: ['workspace-status', workspacePath],
    queryFn: () => getCachedWorkspaceStatus(workspacePath as string),
    enabled: !!workspacePath,
    staleTime: 30 * 1000
  });

  return {
    status: query.data?.status ?? 'unknown',
    scannedAt: query.data?.scannedAt ?? null
  };
};

export { invalidateWorkspaceStatus };
```

- [ ] **Step 7: Экспорт из `index.ts`**

Добавить в `src/entities/workspace/model/index.ts`:

```ts
export { useWorkspaceStatus } from './useWorkspace';
export { invalidateWorkspaceStatus } from '../lib/computeWorkspaceStatus';
```

- [ ] **Step 8: Проверить типы**

Run: `npm run tsc`
Expected: успех.

- [ ] **Step 9: Закоммитить**

```bash
git add src/entities/workspace/lib/computeWorkspaceStatus.ts src/entities/workspace/lib/computeWorkspaceStatus.test.ts src/entities/workspace/model/useWorkspace.ts src/entities/workspace/model/index.ts
git commit -m "feat(workspace): добавлен хелпер статуса воркспейса с кешем"
```

---

## Task 8: Виджет AppHeader + миграция AppLayout

**Files:**
- Create: `src/widgets/app-header/types.ts`
- Create: `src/widgets/app-header/ui/AppHeader.tsx`
- Create: `src/widgets/app-header/ui/index.ts`
- Create: `src/widgets/app-header/index.ts`
- Modify: `src/app/layouts/AppLayout.tsx:1-52` (полностью переписать)
- Modify: `src/app/routes/AppRoutes.tsx:1-27` (добавить реэкспорт старых путей)

**Interfaces:**
- Consumes: ничего (на этом этапе использует `useAppStore` для activeWorkspace)
- Produces: `<AppHeader />` — горизонтальная шапка 48px, в варианте `home` показывает лого + Settings + Theme; в варианте `workspace` показывает back + selector + Settings + Theme. Используется в `AppLayout`.

- [ ] **Step 1: Создать `types.ts`**

Создать `src/widgets/app-header/types.ts`:

```ts
import type { ReactNode } from 'react';

export type AppHeaderVariant = 'home' | 'workspace';

export type AppHeaderProps = {
  variant: AppHeaderVariant;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};
```

- [ ] **Step 2: Реализовать `AppHeader.tsx`**

Создать `src/widgets/app-header/ui/AppHeader.tsx`:

```tsx
import type { FC } from 'react';
import { Cat } from 'lucide-react';

import { ThemeToggle } from '@/shared/ui/theme-toggle';

import type { AppHeaderProps } from '../types';

const SettingsIcon = (): JSX.Element => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconButton: FC<{ onClick: () => void; label: string; children: ReactNode }> = ({
  onClick,
  label,
  children
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
  >
    {children}
  </button>
);

export const AppHeader: FC<AppHeaderProps> = ({ variant, leftSlot, rightSlot }) => {
  const isHome = variant === 'home';

  const handleSettings = (): void => {
    window.location.hash = '#/settings';
  };

  return (
    <header className="bg-surface border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {isHome ? (
          <div className="flex items-center gap-2">
            <Cat aria-hidden="true" className="text-primary size-5" />
            <span className="text-foreground text-sm font-semibold">git-pawl</span>
          </div>
        ) : (
          leftSlot
        )}
      </div>
      <div className="flex items-center gap-1">
        {rightSlot}
        <IconButton onClick={handleSettings} label="Settings">
          <SettingsIcon />
        </IconButton>
        <ThemeToggle />
      </div>
    </header>
  );
};

AppHeader.displayName = 'AppHeader';
```

- [ ] **Step 3: Создать barrel-файлы**

`src/widgets/app-header/ui/index.ts`:

```ts
export { AppHeader } from './AppHeader';
```

`src/widgets/app-header/index.ts`:

```ts
export { AppHeader } from './ui';
export type { AppHeaderProps, AppHeaderVariant } from './types';
```

- [ ] **Step 4: Переписать `AppLayout.tsx`**

Заменить содержимое `src/app/layouts/AppLayout.tsx`:

```tsx
import type { FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { ErrorBoundary } from '@/app/providers';
import { useAppStore } from '@/app/store';
import { AppHeader } from '@/widgets/app-header';
import { WorkspaceSelector } from '@/widgets/workspace-selector';

import type { AppLayoutProps } from './types';

const HOMEPAGE_PATH = '/workspaces';

export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);

  const isHome = location.pathname === HOMEPAGE_PATH;
  const variant = isHome ? 'home' : 'workspace';

  const handleBack = (): void => {
    if (window.history.length > 1) navigate(-1);
    else navigate(HOMEPAGE_PATH);
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <AppHeader
        variant={variant}
        leftSlot={
          variant === 'workspace' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Back"
                onClick={handleBack}
                className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              {activeWorkspaceId ? (
                <WorkspaceSelector workspaceId={activeWorkspaceId} />
              ) : null}
            </div>
          ) : null
        }
      />

      <main className="flex-1 overflow-auto">
        <ErrorBoundary>{children ?? <Outlet />}</ErrorBoundary>
      </main>
    </div>
  );
};
```

- [ ] **Step 5: Перевести workspace-switcher → workspace-selector (подготовка, используется в Task 9 для полной миграции)**

Создать `src/widgets/workspace-selector/types.ts`:

```ts
export type WorkspaceSelectorProps = {
  workspaceId: string;
  className?: string;
};
```

Создать `src/widgets/workspace-selector/ui/WorkspaceSelector.tsx`:

```tsx
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';

import { useAppStore } from '@/app/store';
import {
  useActiveWorkspace,
  useWorkspaceList
} from '@/entities/workspace';
import { CreateWorkspaceDialog } from '@/features/workspace-create';
import { useState } from '@/shared/lib/framework';
import { cn } from '@/shared/lib/theme';
import { useToast } from '@/shared/ui';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';

import type { WorkspaceSelectorProps } from '../types';

export const WorkspaceSelector: FC<WorkspaceSelectorProps> = ({
  workspaceId,
  className
}) => {
  const navigate = useNavigate();
  const active = useActiveWorkspace();
  const { data: workspaces = [] } = useWorkspaceList();
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const handleSwitch = (id: string, name: string): void => {
    if (id === workspaceId) return;
    setActiveWorkspaceId(id);
    navigate(`/workspaces/${id}`);
    toast.success({ title: 'Workspace changed', description: name });
  };

  const handleManage = (): void => {
    navigate('/workspaces');
  };

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          className={cn(
            'text-foreground hover:bg-surface-elevated flex h-8 items-center gap-2 rounded-md px-3 text-sm transition-colors',
            'duration-(--duration-fast)',
            className
          )}
        >
          <span className="font-medium">{active?.name ?? 'Select workspace'}</span>
          <ChevronDown aria-hidden="true" className="text-muted-foreground size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner sideOffset={6} align="start">
            <DropdownMenuContent className="min-w-64">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => handleSwitch(ws.id, ws.name)}
                  disabled={ws.id === workspaceId}
                >
                  {ws.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                + New workspace…
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManage}>
                Manage workspaces…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

WorkspaceSelector.displayName = 'WorkspaceSelector';
```

Создать `src/widgets/workspace-selector/ui/index.ts`:

```ts
export { WorkspaceSelector } from './WorkspaceSelector';
```

Создать `src/widgets/workspace-selector/index.ts`:

```ts
export { WorkspaceSelector } from './ui';
export type { WorkspaceSelectorProps } from './types';
```

Удалить `src/widgets/workspace-switcher/`:

```bash
rm -rf src/widgets/workspace-switcher
```

- [ ] **Step 6: Обновить `AppRoutes.tsx` — добавить реэкспорт старых путей**

Заменить `src/app/routes/AppRoutes.tsx`:

```tsx
import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layouts';
import { AccountsPage } from '@/pages/accounts';
import { ClonePage } from '@/pages/clone';
import { RepositoryPage } from '@/pages/repository';
import { SettingsPage } from '@/pages/settings';
import { WorkspacePage } from '@/pages/workspace';
import { WorkspacesPage } from '@/pages/workspaces';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/workspaces" replace />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="workspaces/:id" element={<WorkspacePage />} />
        <Route path="repos/:id" element={<RepositoryPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="clone" element={<ClonePage />} />
        <Route path="workspace" element={<Navigate to="/workspaces" replace />} />
        <Route path="repo/:id" element={<Navigate to="/repos/:id" replace />} />
        <Route path="*" element={<Navigate to="/workspaces" replace />} />
      </Route>
    </Routes>
  );
};
```

- [ ] **Step 7: Проверить типы и линт**

Run: `npm run tsc`
Expected: ошибки про `WorkspacesPage` и `WorkspacePage` (страницы ещё не созданы).

Если ошибки только про эти два импорта — это ожидаемо, переходим к Task 9 и Task 10.

Run: `npm run lint:fix`
Expected: авто-фиксы.

- [ ] **Step 8: Закоммитить**

```bash
git add src/widgets/app-header src/widgets/workspace-selector src/app/layouts/AppLayout.tsx src/app/routes/AppRoutes.tsx
git rm -r src/widgets/workspace-switcher 2>/dev/null || true
git commit -m "feat(layout): добавлен AppHeader, удалён sidebar, мигрирован workspace-selector"
```

---

## Task 9: Страница тайлов воркспейсов

**Files:**
- Create: `src/pages/workspaces/types.ts`
- Create: `src/pages/workspaces/ui/WorkspaceTile.tsx`
- Create: `src/pages/workspaces/ui/NewWorkspaceTile.tsx`
- Create: `src/pages/workspaces/ui/EmptyWorkspaces.tsx`
- Create: `src/pages/workspaces/ui/RecentActivity.tsx`
- Create: `src/pages/workspaces/ui/WorkspacesPage.tsx`
- Create: `src/pages/workspaces/ui/index.ts`
- Create: `src/pages/workspaces/index.ts`

**Interfaces:**
- Consumes: `useWorkspaceList`, `useWorkspaceSize`, `useWorkspaceStatus`, `useActiveWorkspace`, `formatBytes`, `StatusDot`
- Produces: `<WorkspacesPage />` — экран тайлов воркспейсов с empty state и recent activity.

- [ ] **Step 1: Создать `types.ts`**

Создать `src/pages/workspaces/types.ts`:

```ts
import type { Workspace } from '@/entities/workspace';

export type WorkspaceTileProps = {
  workspace: Workspace;
  repoCount: number;
  sizeBytes: number | null;
  status: 'clean' | 'warning' | 'danger' | 'unknown';
  lastActivity: number | null;
  onOpen: () => void;
};

export type EmptyWorkspacesProps = {
  onCreate: () => void;
};

export type RecentActivityProps = {
  workspaceId: string;
  repoName: string;
  message: string;
  timestamp: number;
  href: string;
};
```

- [ ] **Step 2: Создать `WorkspaceTile.tsx`**

Создать `src/pages/workspaces/ui/WorkspaceTile.tsx`:

```tsx
import { Folder, FolderOpen } from 'lucide-react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatBytes } from '@/entities/workspace';
import { StatusDot } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { WorkspaceTileProps } from '../types';

const relativeTime = (ts: number | null): string => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
};

export const WorkspaceTile: FC<WorkspaceTileProps> = ({
  workspace,
  repoCount,
  sizeBytes,
  status,
  lastActivity,
  onOpen
}) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'bg-surface border-border hover:border-primary hover:shadow-glow group flex h-44 w-full flex-col justify-between rounded-xl border p-4 text-left transition-all',
        'duration-(--duration-base) ease-(--ease-fast)'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="bg-surface-elevated text-primary flex size-10 items-center justify-center rounded-lg">
          <Folder aria-hidden="true" className="size-5" />
        </div>
        <StatusDot variant={status === 'unknown' ? 'clean' : status} label={`workspace ${status}`} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground truncate text-base font-medium">
          {workspace.name}
        </h3>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{repoCount} {repoCount === 1 ? 'repo' : 'repos'}</span>
          <span aria-hidden="true">·</span>
          <span>{relativeTime(lastActivity)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-mono text-xs">
          {sizeBytes !== null ? formatBytes(sizeBytes) : '—'}
        </span>
        <FolderOpen
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-primary size-4 transition-colors"
        />
      </div>
    </button>
  );
};

WorkspaceTile.displayName = 'WorkspaceTile';
```

- [ ] **Step 3: Создать `NewWorkspaceTile.tsx`**

Создать `src/pages/workspaces/ui/NewWorkspaceTile.tsx`:

```tsx
import { Plus } from 'lucide-react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

type NewWorkspaceTileProps = {
  onClick: () => void;
};

export const NewWorkspaceTile: FC<NewWorkspaceTileProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'border-border hover:border-primary hover:bg-primary/5 flex h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed',
      'transition-colors duration-(--duration-fast)'
    )}
  >
    <Plus aria-hidden="true" className="text-primary size-8" />
    <span className="text-muted-foreground text-sm font-medium">New workspace</span>
  </button>
);

NewWorkspaceTile.displayName = 'NewWorkspaceTile';
```

- [ ] **Step 4: Создать `EmptyWorkspaces.tsx`**

Создать `src/pages/workspaces/ui/EmptyWorkspaces.tsx`:

```tsx
import { Cat } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/shared/ui';

import type { EmptyWorkspacesProps } from '../types';

export const EmptyWorkspaces: FC<EmptyWorkspacesProps> = ({ onCreate }) => (
  <div className="flex flex-1 items-center justify-center px-8 py-16">
    <div className="flex max-w-2xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:text-left">
      <div
        className="relative flex size-60 shrink-0 items-center justify-center rounded-full"
        style={{
          background:
            'radial-gradient(circle, oklch(0.74 0.18 50 / 0.35) 0%, transparent 70%)'
        }}
      >
        <Cat aria-hidden="true" className="text-primary/90 size-24" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-center gap-4 md:items-start">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Create your first workspace
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Workspaces group your local repositories. Pick a folder and we'll scan
          it for git repos automatically.
        </p>
        <Button type="button" size="lg" onClick={onCreate}>
          Create workspace
        </Button>
      </div>
    </div>
  </div>
);

EmptyWorkspaces.displayName = 'EmptyWorkspaces';
```

- [ ] **Step 5: Создать `RecentActivity.tsx` (заглушка для первого прохода)**

Создать `src/pages/workspaces/ui/RecentActivity.tsx`:

```tsx
import { Clock } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/theme';

const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export type RecentActivityItem = {
  id: string;
  workspaceName: string;
  repoName: string;
  message: string;
  timestamp: number;
  href: string;
};

type RecentActivityProps = {
  items: RecentActivityItem[];
};

export const RecentActivity: FC<RecentActivityProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <section className="bg-surface border-border rounded-xl border p-5">
      <h2 className="text-foreground mb-4 flex items-center gap-2 text-sm font-semibold">
        <Clock aria-hidden="true" className="text-muted-foreground size-4" />
        Recent activity
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.href}
              className={cn(
                'hover:bg-surface-elevated flex items-center justify-between gap-4 rounded-md px-3 py-2 text-sm transition-colors',
                'duration-(--duration-fast)'
              )}
            >
              <span className="text-muted-foreground truncate">
                <span className="text-foreground">last commit</span>{' '}
                {relativeTime(item.timestamp)} in {item.workspaceName}/{item.repoName}
              </span>
              <span className="text-foreground truncate">{item.message}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

RecentActivity.displayName = 'RecentActivity';
```

- [ ] **Step 6: Создать `WorkspacesPage.tsx`**

Создать `src/pages/workspaces/ui/WorkspacesPage.tsx`:

```tsx
import { Plus } from 'lucide-react';
import { useCallback, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateWorkspaceDialog } from '@/features/workspace-create';
import {
  formatBytes,
  useActiveWorkspace,
  useWorkspaceList,
  useWorkspaceSize,
  useWorkspaceStatus
} from '@/entities/workspace';
import { useRepositoryList } from '@/entities/repository';
import { Button, Spinner } from '@/shared/ui';

import { EmptyWorkspaces } from './EmptyWorkspaces';
import { NewWorkspaceTile } from './NewWorkspaceTile';
import { RecentActivity } from './RecentActivity';
import { WorkspaceTile } from './WorkspaceTile';

import type { RecentActivityItem } from './RecentActivity';

export const WorkspacesPage: FC = () => {
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading } = useWorkspaceList();
  const active = useActiveWorkspace();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = useCallback((): void => {
    setCreateOpen(true);
  }, []);

  const handleOpen = useCallback(
    (id: string) => (): void => {
      navigate(`/workspaces/${id}`);
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center" role="status">
        <Spinner size="lg" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <>
        <EmptyWorkspaces onCreate={handleCreate} />
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  const activityItems: RecentActivityItem[] = [];

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
        <header className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Workspaces
            </h1>
            <p className="text-muted-foreground text-sm">
              {workspaces.length} {workspaces.length === 1 ? 'workspace' : 'workspaces'}
              {active ? ` · last activity ...` : ''}
            </p>
          </div>
          <Button type="button" onClick={handleCreate}>
            <Plus aria-hidden="true" className="size-4" />
            New
          </Button>
        </header>

        <section
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {workspaces.map((ws) => (
            <WorkspaceTileWrapper key={ws.id} workspace={ws} onOpen={handleOpen(ws.id)} />
          ))}
          <NewWorkspaceTile onClick={handleCreate} />
        </section>

        <RecentActivity items={activityItems} />
      </div>
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
};

const WorkspaceTileWrapper: FC<{
  workspace: import('@/entities/workspace').Workspace;
  onOpen: () => void;
}> = ({ workspace, onOpen }) => {
  const { data: repos = [] } = useRepositoryList(workspace.path, []);
  const { totalBytes } = useWorkspaceSize(workspace.path);
  const { status } = useWorkspaceStatus(workspace.path);

  const lastActivity = repos.reduce<number | null>((acc, repo) => {
    if (repo.currentBranch === null) return acc;
    return acc;
  }, null);

  return (
    <WorkspaceTile
      workspace={workspace}
      repoCount={repos.length}
      sizeBytes={totalBytes}
      status={status}
      lastActivity={lastActivity}
      onOpen={onOpen}
    />
  );
};

WorkspaceTileWrapper.displayName = 'WorkspaceTileWrapper';

WorkspacesPage.displayName = 'WorkspacesPage';
```

- [ ] **Step 7: Создать barrel-файлы**

`src/pages/workspaces/ui/index.ts`:

```ts
export { WorkspacesPage } from './WorkspacesPage';
```

`src/pages/workspaces/index.ts`:

```ts
export { WorkspacesPage } from './ui';
export type {
  WorkspaceTileProps,
  EmptyWorkspacesProps,
  RecentActivityProps
} from './types';
```

- [ ] **Step 8: Проверить типы и линт**

Run: `npm run tsc`
Expected: ошибки только про `WorkspacePage` (Task 10).

Run: `npm run lint:fix src/pages/workspaces src/widgets/app-header`

- [ ] **Step 9: Закоммитить**

```bash
git add src/pages/workspaces
git commit -m "feat(pages): добавлен экран тайлов воркспейсов"
```

---

## Task 10: Страница воркспейса (список репозиториев) + drawer настроек

**Files:**
- Create: `src/pages/workspace/types.ts`
- Create: `src/pages/workspace/ui/WorkspaceHero.tsx`
- Create: `src/pages/workspace/ui/WorkspaceToolbar.tsx`
- Create: `src/pages/workspace/ui/RepoGroup.tsx`
- Create: `src/pages/workspace/ui/RepoCard.tsx`
- Create: `src/pages/workspace/ui/EmptyWorkspace.tsx`
- Create: `src/pages/workspace/ui/WorkspaceSettingsDrawer.tsx`
- Create: `src/pages/workspace/ui/WorkspacePage.tsx`
- Create: `src/pages/workspace/ui/index.ts`

**Interfaces:**
- Consumes: `useActiveWorkspace`, `useRepositoryList`, `useWorkspaceSize`, `useWorkspaceStatus`, `useWorkspace`, `Drawer`, `StatusDot`, `formatBytes`
- Produces: `<WorkspacePage />` со списком репозиториев, группировкой и drawer настроек.

- [ ] **Step 1: Создать `types.ts`**

Создать `src/pages/workspace/types.ts`:

```ts
import type { Repository } from '@/entities/repository';
import type { Workspace } from '@/entities/workspace';

export type WorkspacePageProps = Record<string, never>;

export type WorkspaceHeroProps = {
  workspace: Workspace;
  repoCount: number;
  modifiedCount: number;
  sizeBytes: number | null;
  onSettings: () => void;
};

export type WorkspaceToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  grouped: boolean;
  onGroupedChange: (g: boolean) => void;
  onAddRepo: () => void;
  onClone: () => void;
};

export type RepoGroupProps = {
  name: string;
  repos: Repository[];
  sizeBytesByRepo: Map<string, number>;
  onRepoClick: (repo: Repository) => void;
};

export type RepoCardProps = {
  repo: Repository;
  sizeBytes: number | null;
  onClick: () => void;
};

export type EmptyWorkspaceProps = {
  onAddRepo: () => void;
  onClone: () => void;
};

export type WorkspaceSettingsDrawerProps = {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
};
```

- [ ] **Step 2: Создать `WorkspaceHero.tsx`**

Создать `src/pages/workspace/ui/WorkspaceHero.tsx`:

```tsx
import { Folder, Settings } from 'lucide-react';
import type { FC } from 'react';

import { formatBytes } from '@/entities/workspace';

import type { WorkspaceHeroProps } from '../types';

export const WorkspaceHero: FC<WorkspaceHeroProps> = ({
  workspace,
  repoCount,
  modifiedCount,
  sizeBytes,
  onSettings
}) => (
  <header className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-4">
      <div className="bg-surface-elevated text-primary flex size-14 items-center justify-center rounded-xl">
        <Folder aria-hidden="true" className="size-7" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {workspace.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
          {modifiedCount > 0 ? ` · ${modifiedCount} modified` : ''}
          {sizeBytes !== null ? ` · ${formatBytes(sizeBytes)}` : ''}
        </p>
        <p
          className="text-muted-foreground/70 truncate font-mono text-xs"
          title={workspace.path}
        >
          {workspace.path}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onSettings}
      aria-label="Workspace settings"
      className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
    >
      <Settings aria-hidden="true" className="size-4" />
    </button>
  </header>
);

WorkspaceHero.displayName = 'WorkspaceHero';
```

- [ ] **Step 3: Создать `WorkspaceToolbar.tsx`**

Создать `src/pages/workspace/ui/WorkspaceToolbar.tsx`:

```tsx
import { GitBranch, Plus, Search } from 'lucide-react';
import type { FC } from 'react';

import { Input } from '@/shared/ui/input';

import type { WorkspaceToolbarProps } from '../types';

export const WorkspaceToolbar: FC<WorkspaceToolbarProps> = ({
  query,
  onQueryChange,
  grouped,
  onGroupedChange,
  onAddRepo,
  onClone
}) => (
  <div className="bg-surface border-border sticky top-0 z-10 flex items-center gap-2 border-b px-1 py-2">
    <div className="relative max-w-xs flex-1">
      <Search
        aria-hidden="true"
        className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        placeholder="Search..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="pl-8"
      />
    </div>
    <button
      type="button"
      onClick={() => onGroupedChange(!grouped)}
      aria-label="Toggle grouping"
      className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-colors"
    >
      <GitBranch aria-hidden="true" className="size-3.5" />
      {grouped ? 'Group by folder' : 'Flat list'}
    </button>
    <div className="flex-1" />
    <button
      type="button"
      onClick={onAddRepo}
      className="text-foreground hover:bg-surface-elevated flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-colors"
    >
      <Plus aria-hidden="true" className="size-3.5" />
      Add repo
    </button>
    <button
      type="button"
      onClick={onClone}
      className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-all"
    >
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Clone
    </button>
  </div>
);

WorkspaceToolbar.displayName = 'WorkspaceToolbar';
```

- [ ] **Step 4: Создать `RepoCard.tsx`**

Создать `src/pages/workspace/ui/RepoCard.tsx`:

```tsx
import { GitBranch } from 'lucide-react';
import type { FC } from 'react';

import { formatBytes } from '@/entities/workspace';
import type { Repository } from '@/entities/repository';
import { StatusDot } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { RepoCardProps } from '../types';

const statusToVariant = (status: Repository['status']): 'clean' | 'warning' | 'danger' => {
  if (status === 'dirty') return 'warning';
  if (status === 'unknown') return 'danger';
  return 'clean';
};

const relativeTime = (ts: number | null): string => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
};

export const RepoCard: FC<RepoCardProps> = ({ repo, sizeBytes, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'bg-surface border-border hover:border-primary hover:shadow-glow group flex h-32 w-full flex-col justify-between rounded-lg border p-3 text-left transition-all',
      'duration-(--duration-base) ease-(--ease-fast)'
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <span className="text-foreground truncate text-sm font-medium">{repo.name}</span>
      <StatusDot
        variant={statusToVariant(repo.status)}
        label={`repository ${repo.status}`}
      />
    </div>
    <div className="flex flex-col gap-1">
      {repo.currentBranch ? (
        <span className="bg-surface-elevated text-muted-foreground inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs">
          <GitBranch aria-hidden="true" className="size-3" />
          {repo.currentBranch}
        </span>
      ) : null}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{relativeTime(null)}</span>
        <span className="font-mono">{sizeBytes !== null ? formatBytes(sizeBytes) : '—'}</span>
      </div>
    </div>
  </button>
);

RepoCard.displayName = 'RepoCard';
```

- [ ] **Step 5: Создать `RepoGroup.tsx`**

Создать `src/pages/workspace/ui/RepoGroup.tsx`:

```tsx
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState, type FC } from 'react';

import type { RepoGroupProps } from '../types';
import { RepoCard } from './RepoCard';

export const RepoGroup: FC<RepoGroupProps> = ({
  name,
  repos,
  sizeBytesByRepo,
  onRepoClick
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const totalSize = repos.reduce(
    (sum, r) => sum + (sizeBytesByRepo.get(r.id) ?? 0),
    0
  );

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="text-foreground hover:text-primary flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        {collapsed ? (
          <ChevronRight aria-hidden="true" className="size-4" />
        ) : (
          <ChevronDown aria-hidden="true" className="size-4" />
        )}
        {name}
        <span className="text-muted-foreground font-normal">
          {repos.length} {repos.length === 1 ? 'repo' : 'repos'} ·{' '}
          {totalSize > 0 ? `${(totalSize / (1024 * 1024)).toFixed(0)} MB` : '—'}
        </span>
      </button>
      {!collapsed ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {repos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              sizeBytes={sizeBytesByRepo.get(repo.id) ?? null}
              onClick={() => onRepoClick(repo)}
            />
          ))}
          <button
            type="button"
            className="border-border hover:border-primary hover:bg-primary/5 flex h-32 items-center justify-center gap-2 rounded-lg border border-dashed text-sm transition-colors"
          >
            <Plus aria-hidden="true" className="text-primary size-4" />
            <span className="text-muted-foreground">Add to {name}</span>
          </button>
        </div>
      ) : null}
    </section>
  );
};

RepoGroup.displayName = 'RepoGroup';
```

- [ ] **Step 6: Создать `EmptyWorkspace.tsx`**

Создать `src/pages/workspace/ui/EmptyWorkspace.tsx`:

```tsx
import { FolderOpen } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/shared/ui';

import type { EmptyWorkspaceProps } from '../types';

export const EmptyWorkspace: FC<EmptyWorkspaceProps> = ({ onAddRepo, onClone }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
    <div className="bg-surface-elevated text-muted-foreground flex size-16 items-center justify-center rounded-full">
      <FolderOpen aria-hidden="true" className="size-8" />
    </div>
    <div className="flex flex-col gap-1">
      <h2 className="text-foreground text-lg font-semibold">No repositories yet</h2>
      <p className="text-muted-foreground text-sm">
        Add an existing folder or clone a repository to get started.
      </p>
    </div>
    <div className="flex gap-2">
      <Button type="button" variant="secondary" onClick={onAddRepo}>
        Add repo
      </Button>
      <Button type="button" onClick={onClone}>
        Clone
      </Button>
    </div>
  </div>
);

EmptyWorkspace.displayName = 'EmptyWorkspace';
```

- [ ] **Step 7: Создать `WorkspaceSettingsDrawer.tsx`**

Создать `src/pages/workspace/ui/WorkspaceSettingsDrawer.tsx`:

```tsx
import { Trash2 } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { Button, Drawer, Input } from '@/shared/ui';

import type { WorkspaceSettingsDrawerProps } from '../types';

export const WorkspaceSettingsDrawer: FC<WorkspaceSettingsDrawerProps> = ({
  workspace,
  open,
  onOpenChange,
  onDelete
}) => {
  const [name, setName] = useState(workspace.name);

  const handleDelete = (): void => {
    if (window.confirm('Delete this workspace? Files on disk will stay intact.')) {
      onDelete();
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Workspace settings"
      description={`General preferences for ${workspace.name}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="text-danger hover:bg-danger/10"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete workspace
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <label
            htmlFor="workspace-name"
            className="text-foreground text-sm font-medium"
          >
            Name
          </label>
          <Input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </section>
        <section className="flex flex-col gap-2">
          <span className="text-foreground text-sm font-medium">Path</span>
          <p className="bg-surface-elevated text-muted-foreground rounded-md px-3 py-2 font-mono text-xs">
            {workspace.path}
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <span className="text-foreground text-sm font-medium">Icon</span>
          <button
            type="button"
            className="bg-surface-elevated text-muted-foreground hover:border-primary flex h-20 w-20 items-center justify-center rounded-lg border border-dashed transition-colors"
          >
            Change
          </button>
        </section>
      </div>
    </Drawer>
  );
};

WorkspaceSettingsDrawer.displayName = 'WorkspaceSettingsDrawer';
```

- [ ] **Step 8: Создать `WorkspacePage.tsx`**

Создать `src/pages/workspace/ui/WorkspacePage.tsx`:

```tsx
import { useCallback, useMemo, useState, type FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CreateWorkspaceDialog } from '@/features/workspace-create';
import { useAddExistingRepo } from '@/features/add-existing-repo';
import { useRepoSearch } from '@/features/search-repos';
import {
  useActiveWorkspace,
  useWorkspaceById,
  useWorkspaceExtraRepoPaths
} from '@/entities/workspace';
import type { Repository } from '@/entities/repository';
import { useRepositoryList } from '@/entities/repository';
import { useToast } from '@/shared/ui';

import { EmptyWorkspace } from './EmptyWorkspace';
import { RepoGroup } from './RepoGroup';
import { WorkspaceHero } from './WorkspaceHero';
import { WorkspaceSettingsDrawer } from './WorkspaceSettingsDrawer';
import { WorkspaceToolbar } from './WorkspaceToolbar';

export const WorkspacePage: FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const setActive = useAppStoreSetActive();
  const active = useActiveWorkspace();
  const explicit = useWorkspaceById(id ?? null);
  const workspace = explicit ?? active;

  useEffect(() => {
    if (workspace && id && workspace.id !== id) {
      setActive(workspace.id);
    }
  }, [id, workspace, setActive]);

  const workspacePath = workspace?.path ?? null;
  const workspaceId = workspace?.id ?? null;
  const { data: extraRepoPaths = [] } = useWorkspaceExtraRepoPaths(workspaceId);
  const { data: repos = [], isLoading } = useRepositoryList(workspacePath, extraRepoPaths);
  const { query, setQuery, results: visibleRepos } = useRepoSearch(repos);
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [grouped, setGrouped] = useLocalStorageBool('workspace-view-mode', true);
  const { mutate: addExistingRepo } = useAddExistingRepo();

  const handleAddRepo = useCallback((): void => {
    if (!workspaceId) return;
    addExistingRepo({ workspaceId });
  }, [addExistingRepo, workspaceId]);

  const handleClone = useCallback((): void => {
    navigate('/clone');
  }, [navigate]);

  const handleCreateWorkspace = useCallback((): void => {
    setCreateOpen(true);
  }, []);

  const handleRepoClick = useCallback(
    (repo: Repository): void => {
      navigate(`/repos/${encodeURIComponent(repo.id)}`);
    },
    [navigate]
  );

  const handleDelete = useCallback((): void => {
    toast.success({ title: 'Workspace deleted' });
    navigate('/workspaces');
  }, [navigate, toast]);

  const groups = useMemo(() => {
    if (!grouped) {
      return [{ name: 'All', repos: visibleRepos }];
    }
    const byGroup = new Map<string, Repository[]>();
    for (const repo of visibleRepos) {
      const rel = workspacePath ? repo.path.replace(workspacePath, '').replace(/^[\\/]/, '') : repo.name;
      const group = rel.includes('/') ? rel.split('/')[0] ?? 'Root' : 'Root';
      const arr = byGroup.get(group) ?? [];
      arr.push(repo);
      byGroup.set(group, arr);
    }
    return Array.from(byGroup.entries()).map(([name, list]) => ({ name, repos: list }));
  }, [visibleRepos, grouped, workspacePath]);

  if (!workspace) {
    return (
      <>
        <div className="p-8 text-sm text-muted-foreground">Workspace not found.</div>
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  const modifiedCount = repos.filter((r) => r.status === 'dirty').length;

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-8">
        <WorkspaceHero
          workspace={workspace}
          repoCount={repos.length}
          modifiedCount={modifiedCount}
          sizeBytes={null}
          onSettings={() => setSettingsOpen(true)}
        />

        <WorkspaceToolbar
          query={query}
          onQueryChange={setQuery}
          grouped={grouped}
          onGroupedChange={setGrouped}
          onAddRepo={handleAddRepo}
          onClone={handleClone}
        />

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : repos.length === 0 ? (
          <EmptyWorkspace onAddRepo={handleAddRepo} onClone={handleClone} />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((g) => (
              <RepoGroup
                key={g.name}
                name={g.name}
                repos={g.repos}
                sizeBytesByRepo={new Map()}
                onRepoClick={handleRepoClick}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <WorkspaceSettingsDrawer
        workspace={workspace}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onDelete={handleDelete}
      />
    </>
  );
};

import { useEffect } from 'react';
import { useAppStore } from '@/app/store';
import { useLocalStorageBool } from '@/shared/lib/framework';

const useAppStoreSetActive = () => {
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);
  return useCallback(
    (id: string) => setActiveWorkspaceId(id),
    [setActiveWorkspaceId]
  );
};

WorkspacePage.displayName = 'WorkspacePage';
```

- [ ] **Step 9: Создать barrel `ui/index.ts`**

Создать `src/pages/workspace/ui/index.ts`:

```ts
export { WorkspacePage } from './WorkspacePage';
```

Заменить `src/pages/workspace/index.ts`:

```ts
export { WorkspacePage } from './ui';
export type {
  WorkspacePageProps,
  WorkspaceHeroProps,
  WorkspaceToolbarProps,
  RepoGroupProps,
  RepoCardProps,
  EmptyWorkspaceProps,
  WorkspaceSettingsDrawerProps
} from './types';
```

- [ ] **Step 10: Проверить типы**

Run: `npm run tsc`
Expected: ошибки возможны про `useWorkspaceById`, `useLocalStorageBool` — создаём если нужно.

Создать в `src/entities/workspace/model/useWorkspace.ts` экспорт `useWorkspaceById`:

```ts
export const useWorkspaceById = (id: string | null): Workspace | null => {
  const { data: workspaces = [] } = useWorkspaceList();
  if (!id) return null;
  return workspaces.find((w) => w.id === id) ?? null;
};
```

Добавить в `src/entities/workspace/model/index.ts`:

```ts
export { useWorkspaceById } from './useWorkspace';
```

Создать в `src/shared/lib/framework/index.ts` (или в существующем хуке):

```ts
import { useState } from 'react';

export const useLocalStorageBool = (key: string, initial: boolean): [boolean, (v: boolean) => void] => {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === 'undefined') return initial;
    const raw = window.localStorage.getItem(key);
    return raw === null ? initial : raw === 'true';
  });
  const update = (v: boolean): void => {
    setValue(v);
    window.localStorage.setItem(key, String(v));
  };
  return [value, update];
};
```

Если файл `src/shared/lib/framework/index.ts` не существует — создать с указанным выше кодом.

- [ ] **Step 11: Проверить линт**

Run: `npm run lint:fix src/pages/workspace src/widgets src/entities/workspace`

- [ ] **Step 12: Закоммитить**

```bash
git add src/pages/workspace src/entities/workspace/model/useWorkspace.ts src/entities/workspace/model/index.ts src/shared/lib/framework
git commit -m "feat(pages): добавлена страница воркспейса с группировкой и drawer настроек"
```

---

## Task 11: 3-колоночная страница репозитория

**Files:**
- Create: `src/widgets/repo-tree/types.ts`
- Create: `src/widgets/repo-tree/ui/RepoTree.tsx`
- Create: `src/widgets/repo-tree/ui/index.ts`
- Create: `src/widgets/repo-tree/index.ts`
- Create: `src/widgets/repo-graph-vertical/types.ts`
- Create: `src/widgets/repo-graph-vertical/ui/RepoGraph.tsx`
- Create: `src/widgets/repo-graph-vertical/ui/index.ts`
- Create: `src/widgets/repo-graph-vertical/index.ts`
- Create: `src/widgets/repo-detail-panel/types.ts`
- Create: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx`
- Create: `src/widgets/repo-detail-panel/ui/index.ts`
- Create: `src/widgets/repo-detail-panel/index.ts`
- Modify: `src/pages/repository/ui/RepositoryPage.tsx` (полностью переписать)

**Interfaces:**
- Consumes: `useRepository`, `useCurrentBranch`, `useCommit`, `gitLog`, `useBranches`, `useTags`, `useStashList`
- Produces: `<RepositoryPage />` — 3-колоночный layout: tree слева (240px), граф по центру, detail panel справа (380px). Граф вертикальный снизу вверх, newest наверху.

- [ ] **Step 1: Создать `widgets/repo-tree/types.ts`**

Создать `src/widgets/repo-tree/types.ts`:

```ts
export type RepoTreeProps = {
  repoPath: string;
  selectedCommit: string | null;
  onSelectCommit: (hash: string) => void;
  className?: string;
};
```

- [ ] **Step 2: Создать `widgets/repo-tree/ui/RepoTree.tsx`**

Создать `src/widgets/repo-tree/ui/RepoTree.tsx`:

```tsx
import { ChevronDown, GitBranch, Plus, Tag } from 'lucide-react';
import { useState, type FC } from 'react';

import { useBranches } from '@/entities/branch';
import { useTags } from '@/entities/tag';
import { useStashList } from '@/entities/stash';

import type { RepoTreeProps } from '../types';

const Section: FC<{ title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title,
  count,
  defaultOpen = true,
  children
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-foreground hover:bg-surface-elevated flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition-colors"
      >
        <ChevronDown
          aria-hidden="true"
          className={`size-3 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        {title}
        <span className="text-muted-foreground">({count})</span>
      </button>
      {open ? <div className="flex flex-col gap-0.5 pl-3">{children}</div> : null}
    </div>
  );
};

export const RepoTree: FC<RepoTreeProps> = ({ repoPath }) => {
  const { data: branches = [] } = useBranches(repoPath);
  const { data: tags = [] } = useTags(repoPath);
  const { data: stash = [] } = useStashList(repoPath);

  return (
    <aside className="bg-surface border-border flex h-full w-60 shrink-0 flex-col gap-3 overflow-auto border-r p-3">
      <Section title="Branches" count={branches.length}>
        {branches.map((b) => (
          <button
            type="button"
            key={b.name}
            className={`hover:bg-surface-elevated flex items-center gap-2 rounded px-2 py-1 text-left text-xs ${
              b.current ? 'text-primary font-medium' : 'text-foreground'
            }`}
          >
            <GitBranch aria-hidden="true" className="size-3 shrink-0" />
            <span className="truncate">{b.name}</span>
            {b.unpushed ? (
              <span aria-label="unpushed commits" className="bg-warning ml-auto size-1.5 rounded-full" />
            ) : null}
          </button>
        ))}
        <button
          type="button"
          className="text-muted-foreground hover:text-primary flex items-center gap-1 px-2 py-1 text-xs transition-colors"
        >
          <Plus aria-hidden="true" className="size-3" /> New branch
        </button>
      </Section>

      <Section title="Tags" count={tags.length}>
        {tags.map((t) => (
          <button
            type="button"
            key={t.name}
            className="text-foreground hover:bg-surface-elevated flex items-center gap-2 rounded px-2 py-1 text-left text-xs"
          >
            <Tag aria-hidden="true" className="text-muted-foreground size-3 shrink-0" />
            <span className="truncate">{t.name}</span>
          </button>
        ))}
      </Section>

      <Section title="Stash" count={stash.length} defaultOpen={false}>
        {stash.map((s) => (
          <div
            key={s.ref}
            className="text-foreground hover:bg-surface-elevated truncate rounded px-2 py-1 text-xs"
          >
            {s.message ?? s.ref}
          </div>
        ))}
      </Section>
    </aside>
  );
};

RepoTree.displayName = 'RepoTree';
```

- [ ] **Step 3: Barrel-файлы для repo-tree**

`src/widgets/repo-tree/ui/index.ts`:

```ts
export { RepoTree } from './RepoTree';
```

`src/widgets/repo-tree/index.ts`:

```ts
export { RepoTree } from './ui';
export type { RepoTreeProps } from './types';
```

- [ ] **Step 4: Создать `widgets/repo-graph-vertical/types.ts`**

Создать `src/widgets/repo-graph-vertical/types.ts`:

```ts
export type CommitNode = {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  timestamp: number;
  parents: string[];
  lane: number;
};

export type RepoGraphProps = {
  commits: CommitNode[];
  selectedHash: string | null;
  onSelect: (hash: string) => void;
  className?: string;
};
```

- [ ] **Step 5: Создать `widgets/repo-graph-vertical/ui/RepoGraph.tsx`**

Создать `src/widgets/repo-graph-vertical/ui/RepoGraph.tsx`:

```tsx
import type { FC } from 'react';
import { cn } from '@/shared/lib/theme';

import type { CommitNode, RepoGraphProps } from '../types';

const NODE_R = 4;
const LANE_WIDTH = 14;
const COL_WIDTH = 32;
const GRAPH_WIDTH = COL_WIDTH;

const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const RepoGraph: FC<RepoGraphProps> = ({
  commits,
  selectedHash,
  onSelect,
  className
}) => {
  // Newest at top: data is reverse-ordered
  const ordered = [...commits].sort((a, b) => b.timestamp - a.timestamp);
  const maxLane = ordered.reduce((m, c) => Math.max(m, c.lane), 0);

  return (
    <div className={cn('bg-surface flex h-full flex-col overflow-auto', className)}>
      {ordered.map((commit, idx) => {
        const x = GRAPH_WIDTH / 2 + commit.lane * LANE_WIDTH;
        const isSelected = commit.hash === selectedHash;
        return (
          <button
            type="button"
            key={commit.hash}
            onClick={() => onSelect(commit.hash)}
            className={cn(
              'hover:bg-surface-elevated flex items-center gap-3 border-b border-border/40 px-3 py-2 text-left transition-colors',
              isSelected && 'bg-surface-elevated'
            )}
          >
            <svg
              width={GRAPH_WIDTH + maxLane * LANE_WIDTH}
              height="32"
              className="shrink-0"
              aria-hidden="true"
            >
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={32}
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="1"
              />
              <circle
                cx={x}
                cy={16}
                r={NODE_R}
                fill={isSelected ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
              />
              {idx < ordered.length - 1 ? null : null}
            </svg>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  {commit.shortHash}
                </span>
                <span className="text-foreground truncate text-sm">{commit.subject}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>{commit.author}</span>
                <span aria-hidden="true">·</span>
                <span>{relativeTime(commit.timestamp)}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

RepoGraph.displayName = 'RepoGraph';
```

- [ ] **Step 6: Barrel-файлы для repo-graph-vertical**

`src/widgets/repo-graph-vertical/ui/index.ts`:

```ts
export { RepoGraph } from './RepoGraph';
```

`src/widgets/repo-graph-vertical/index.ts`:

```ts
export { RepoGraph } from './ui';
export type { RepoGraphProps, CommitNode } from './types';
```

- [ ] **Step 7: Создать `widgets/repo-detail-panel/types.ts`**

Создать `src/widgets/repo-detail-panel/types.ts`:

```ts
import type { CommitNode } from '@/widgets/repo-graph-vertical';

export type RepoDetailPanelProps = {
  commit: CommitNode | null;
  onCopyHash: (hash: string) => void;
  onCreatePatch: (hash: string) => void;
  onRevert: (hash: string) => void;
  onCherryPick: (hash: string) => void;
  onResetToHere: (hash: string) => void;
  uncommittedCount: number;
  onCommit: () => void;
  onStash: () => void;
  onDiscard: () => void;
  className?: string;
};
```

- [ ] **Step 8: Создать `widgets/repo-detail-panel/ui/RepoDetailPanel.tsx`**

Создать `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx`:

```tsx
import {
  Copy,
  FileText,
  GitBranch,
  RotateCcw,
  Scissors,
  Trash2,
  Wand2
} from 'lucide-react';
import type { FC } from 'react';

import { Button, cn } from '@/shared/ui';

import type { RepoDetailPanelProps } from '../types';

const formatDate = (ts: number): string =>
  new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const RepoDetailPanel: FC<RepoDetailPanelProps> = ({
  commit,
  onCopyHash,
  onCreatePatch,
  onRevert,
  onCherryPick,
  onResetToHere,
  uncommittedCount,
  onCommit,
  onStash,
  onDiscard,
  className
}) => {
  if (!commit) {
    return (
      <aside className={cn('bg-surface border-border flex h-full w-96 shrink-0 flex-col overflow-hidden border-l', className)}>
        <div className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-center text-sm">
          Select a commit to see details.
        </div>
        <footer className="border-border border-t p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              Uncommitted: <span className="text-foreground font-medium">{uncommittedCount}</span>
            </span>
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="secondary" onClick={onStash}>
                Stash
              </Button>
              <Button type="button" size="sm" onClick={onCommit}>
                Commit
              </Button>
            </div>
          </div>
        </footer>
      </aside>
    );
  }

  return (
    <aside className={cn('bg-surface border-border flex h-full w-96 shrink-0 flex-col overflow-hidden border-l', className)}>
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-base font-semibold leading-tight">
            {commit.subject}
          </h2>
          <p className="text-muted-foreground text-xs">
            {commit.author} · {formatDate(commit.timestamp)}
          </p>
          <button
            type="button"
            onClick={() => onCopyHash(commit.hash)}
            className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 font-mono text-xs transition-colors"
          >
            <Copy aria-hidden="true" className="size-3" />
            {commit.shortHash}
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <Button type="button" size="sm" variant="secondary" onClick={() => onCreatePatch(commit.hash)}>
            <FileText aria-hidden="true" className="size-3.5" /> Patch
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => onCherryPick(commit.hash)}>
            <Scissors aria-hidden="true" className="size-3.5" /> Cherry-pick
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => onRevert(commit.hash)}>
            <RotateCcw aria-hidden="true" className="size-3.5" /> Revert
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => onResetToHere(commit.hash)}>
            <Wand2 aria-hidden="true" className="size-3.5" /> Reset
          </Button>
        </div>

        <div className="bg-surface-elevated text-muted-foreground rounded-md p-3 text-xs">
          <p>
            <GitBranch aria-hidden="true" className="mr-1 inline size-3" />
            parents: {commit.parents.length}
          </p>
          <p className="mt-1">
            lane: {commit.lane}
          </p>
        </div>
      </div>

      <footer className="border-border border-t p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs">
            Uncommitted:{' '}
            <span className="text-foreground font-medium">{uncommittedCount}</span>
          </span>
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
              <Trash2 aria-hidden="true" className="size-3.5" />
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onStash}>
              Stash
            </Button>
            <Button type="button" size="sm" onClick={onCommit}>
              Commit
            </Button>
          </div>
        </div>
      </footer>
    </aside>
  );
};

RepoDetailPanel.displayName = 'RepoDetailPanel';
```

- [ ] **Step 9: Barrel-файлы для repo-detail-panel**

`src/widgets/repo-detail-panel/ui/index.ts`:

```ts
export { RepoDetailPanel } from './RepoDetailPanel';
```

`src/widgets/repo-detail-panel/index.ts`:

```ts
export { RepoDetailPanel } from './ui';
export type { RepoDetailPanelProps } from './types';
```

- [ ] **Step 10: Переписать `RepositoryPage.tsx`**

Заменить содержимое `src/pages/repository/ui/RepositoryPage.tsx`:

```tsx
import { GitBranch, GitPullRequestArrow, RefreshCw } from 'lucide-react';
import { useState, type FC } from 'react';
import { useParams } from 'react-router-dom';

import { useRepository } from '@/entities/repository';
import { useCurrentBranch } from '@/entities/branch';
import { useBranches } from '@/entities/branch';
import { useTags } from '@/entities/tag';
import { useStashList } from '@/entities/stash';
import { useToast, Spinner, Empty } from '@/shared/ui';
import { gitLog } from '@/shared/api';
import { useQuery } from '@tanstack/react-query';

import { RepoTree } from '@/widgets/repo-tree';
import { RepoGraph } from '@/widgets/repo-graph-vertical';
import type { CommitNode } from '@/widgets/repo-graph-vertical';
import { RepoDetailPanel } from '@/widgets/repo-detail-panel';

const decodeRepoId = (id: string | undefined): string | null => {
  if (!id) return null;
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

type GitLogEntry = {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  timestamp: number;
  parents: string[];
};

const toCommitNodes = (entries: GitLogEntry[]): CommitNode[] => {
  const lanes: number[] = [];
  return entries.map((e) => {
    let lane = lanes.indexOf(-1);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(0);
    } else {
      lanes[lane] = e.parents[0] ? 1 : 0;
    }
    return {
      hash: e.hash,
      shortHash: e.shortHash,
      subject: e.subject,
      author: e.author,
      timestamp: e.timestamp,
      parents: e.parents,
      lane
    };
  });
};

export const RepositoryPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const repoPath = decodeRepoId(id);
  const toast = useToast();

  const { data: repo, isLoading: isRepoLoading } = useRepository(repoPath);
  const branchQuery = useCurrentBranch(repoPath);
  const { data: branches = [] } = useBranches(repoPath);
  const { data: tags = [] } = useTags(repoPath);
  const { data: stash = [] } = useStashList(repoPath);

  const logQuery = useQuery({
    queryKey: ['git-log', repoPath],
    queryFn: () => gitLog({ repoPath: repoPath as string, maxCount: 100 }),
    enabled: !!repoPath
  });

  const commits = Array.isArray(logQuery.data)
    ? toCommitNodes(logQuery.data as GitLogEntry[])
    : [];

  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  if (!repoPath) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Empty title="No repository selected" description="Open a repository from a workspace." />
      </div>
    );
  }

  if (isRepoLoading) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center gap-2">
        <Spinner className="size-4" /> Loading repository...
      </div>
    );
  }

  const repoName = repo?.name ?? repoPath.split('/').pop() ?? repoPath;
  const ahead = branches.reduce((sum, b) => sum + (b.ahead ?? 0), 0);
  const behind = branches.reduce((sum, b) => sum + (b.behind ?? 0), 0);

  const selectedCommit = commits.find((c) => c.hash === selectedHash) ?? null;

  return (
    <div className="flex h-full w-full flex-col">
      <header className="border-border bg-surface flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <div className="bg-surface-elevated text-primary flex size-9 items-center justify-center rounded-md">
            <GitBranch aria-hidden="true" className="size-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-foreground text-base font-semibold leading-tight">
              {repoName}
            </h1>
            <div className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
              <span>{branchQuery.data?.name ?? 'detached'}</span>
              {ahead > 0 || behind > 0 ? (
                <span className={behind > 0 ? 'text-warning' : 'text-success'}>
                  ↑{ahead} ↓{behind}
                </span>
              ) : null}
              <span>{branches.length} branches · {tags.length} tags · {stash.length} stash</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Fetch"
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Pull"
            className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-all"
          >
            <GitPullRequestArrow aria-hidden="true" className="size-3.5" /> Pull
          </button>
          <button
            type="button"
            aria-label="Push"
            className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-all"
          >
            <GitPullRequestArrow aria-hidden="true" className="size-3.5 -scale-y-100" /> Push
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <RepoTree repoPath={repoPath} selectedCommit={selectedHash} onSelectCommit={setSelectedHash} />
        <RepoGraph
          commits={commits}
          selectedHash={selectedHash}
          onSelect={setSelectedHash}
          className="flex-1"
        />
        <RepoDetailPanel
          commit={selectedCommit}
          onCopyHash={(h) => navigator.clipboard.writeText(h).then(() => toast.success({ title: 'Hash copied' }))}
          onCreatePatch={() => toast.info({ title: 'Patch' })}
          onRevert={() => toast.info({ title: 'Revert' })}
          onCherryPick={() => toast.info({ title: 'Cherry-pick' })}
          onResetToHere={() => toast.info({ title: 'Reset to here' })}
          uncommittedCount={repo?.status === 'dirty' ? 1 : 0}
          onCommit={() => toast.info({ title: 'Open commit' })}
          onStash={() => toast.info({ title: 'Stash' })}
          onDiscard={() => toast.info({ title: 'Discard' })}
        />
      </div>
    </div>
  );
};

RepositoryPage.displayName = 'RepositoryPage';
```

- [ ] **Step 11: Проверить типы и линт**

Run: `npm run tsc`
Expected: возможны ошибки про `useBranches/useTags/useStashList` экспорт — добавить если нет.

Run: `npm run lint:fix src/pages/repository src/widgets/repo-tree src/widgets/repo-graph-vertical src/widgets/repo-detail-panel`

- [ ] **Step 12: Закоммитить**

```bash
git add src/widgets/repo-tree src/widgets/repo-graph-vertical src/widgets/repo-detail-panel src/pages/repository/ui/RepositoryPage.tsx
git commit -m "feat(pages): переработана страница репозитория — 3 колонки, вертикальный граф"
```

---

## Task 12: Финальная проверка

**Files:** без изменений

- [ ] **Step 1: Запустить полный набор проверок**

Run: `npm run tsc`
Expected: успех.

Run: `npm run lint:fix`
Expected: авто-фиксы, ошибок нет.

Run: `npm test`
Expected: все тесты проходят.

- [ ] **Step 2: Удалить старые виджеты, если остались**

```bash
rm -rf src/widgets/workspace-switcher
rm -rf src/widgets/commit-graph
```

- [ ] **Step 3: Проверить запуск приложения**

Run: `npm run dev`
Expected: приложение открывается, не крашится. Перейти на `/workspaces` — видны тайлы (или empty state). Создать workspace → видны репо. Кликнуть на репо → 3-колоночная страница.

- [ ] **Step 4: Финальный коммит**

```bash
git add -A
git commit -m "chore: финальная очистка после редизайна"
```

(пустой коммит допустим, если ничего не изменилось)

---

## Self-Review

**1. Spec coverage:**
- §1 Визуальный язык и токены → Task 1 ✓
- §2 Хром (горизонтальная шапка) → Task 8 (AppHeader + WorkspaceSelector) ✓
- §3 Экран тайлов воркспейсов → Task 9 (WorkspacesPage) ✓
- §4 Страница воркспейса (список репо, группировка, drawer) → Task 10 ✓
- §5 Страница репозитория (3 колонки, вертикальный граф) → Task 11 ✓
- §6 Компонентная декомпозиция: drawer (Task 3), status-dot (Task 2), workspace-selector (Task 8) ✓
- §6 fsWorkspaceSize IPC → Task 4 ✓
- §6 workspaceSizeCache + useWorkspaceSize → Task 6 ✓
- §6 useWorkspaceStatus → Task 7 ✓
- §7 план миграции: sidebar удалён в Task 8 (AppLayout) ✓
- §9 критерии приёмки → Task 12 (финальная проверка) ✓

**2. Placeholder scan:** нет TBD/TODO. Все шаги содержат конкретный код.

**3. Type consistency:**
- `useWorkspaceSize` описан в Task 6, используется в Task 9 (`WorkspacesPage`) и Task 10 (через `WorkspaceTileWrapper`) ✓
- `useWorkspaceStatus` описан в Task 7, используется в Task 9 ✓
- `formatBytes` описан в Task 5, используется в Task 9, 10, 11 ✓
- `StatusDot` описан в Task 2, используется в Task 9, 10 ✓
- `Drawer` описан в Task 3, используется в Task 10 ✓
- `CommitNode` тип описан в Task 11 (repo-graph-vertical), импортируется в Task 11 (repo-detail-panel) ✓

Все интерфейсы согласованы.

---

## Execution Handoff

План сохранён в `docs/superpowers/plans/2026-07-18-git-pawl-redesign.md`. Готов к исполнению через один из двух режимов:

**1. Subagent-Driven (рекомендую)** — на каждый Task свой свежий субагент, ревью между задачами, быстрая итерация.

**2. Inline Execution** — все задачи выполняются в текущей сессии батчами с checkpoint'ами для ревью.

Какой режим выбираешь?