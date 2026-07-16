# TASK-001 — Дизайн-токены и темы

## Цель
Настроить семантические дизайн-токены для светлой и тёмной темы. Тёмная — по умолчанию.

## Что сделать

1. Создать `src/app/styles/theme.css` с `@theme { ... }` для Tailwind v4.
2. Создать `src/app/styles/light.css` с переопределениями для `data-theme="light"`.
3. Создать `src/app/styles/globals.css` с импортом `tailwindcss`, `theme.css`, `light.css`.
4. В `src/app/index.html` по умолчанию `<html data-theme="dark">`.
5. Палитра — оранжевый primary в OKLCH (`oklch(0.72 0.18 50)` или близкий).
6. Токены:
   - `--color-background`, `--color-foreground`
   - `--color-card`, `--color-card-foreground`
   - `--color-primary`, `--color-primary-foreground`
   - `--color-secondary`, `--color-secondary-foreground`
   - `--color-muted`, `--color-muted-foreground`
   - `--color-accent`, `--color-accent-foreground`
   - `--color-destructive`, `--color-destructive-foreground`
   - `--color-border`, `--color-input`, `--color-ring`
   - `--radius-sm/md/lg`
   - `--duration-fast`, `--duration-base`, `--ease-fast`
7. Хук `useTheme()` в `src/shared/lib/theme/useTheme.ts`:
   - читает текущую тему из DOM (`document.documentElement.dataset.theme`)
   - `setTheme('light' | 'dark')` — переключает, persist через electron-store (после TASK-011)
   - пока persist не подключён — localStorage
8. Story `Theme` в Storybook — кнопка переключения dark/light.

## Acceptance criteria
- [ ] Tailwind-класс `bg-background`, `text-foreground`, `bg-primary` работает.
- [ ] `[data-theme="light"]` переключает фон/цвет через CSS-переменные.
- [ ] По умолчанию (без атрибута) применяется dark-палитра.
- [ ] `useTheme()` переключает тему мгновенно без перезагрузки.
- [ ] Сборка story показывает 3 примера: light/dark/side-by-side.

## Зависит от
- TASK-000

## Файлы
- `src/app/styles/theme.css`
- `src/app/styles/light.css`
- `src/app/styles/globals.css`
- `src/shared/lib/theme/useTheme.ts`
- `src/shared/lib/theme/index.ts`
- `src/shared/lib/theme/cn.ts` (clsx + tailwind-merge)
- `.storybook/themes.stories.tsx`
