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
- [x] Tailwind-класс `bg-background`, `text-foreground`, `bg-primary` работает.
- [x] `[data-theme="light"]` переключает фон/цвет через CSS-переменные.
- [x] По умолчанию (без атрибута) применяется dark-палитра.
- [x] `useTheme()` переключает тему мгновенно без перезагрузки.
- [x] Сборка story показывает 3 примера: light/dark/side-by-side.

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

## Статус: DONE — дизайн-токены и тема-переключатель на месте

## Что сделано
- Разнёс токены на три файла: `theme.css` (тёмная палитра по умолчанию через `@theme`), `light.css` (overrides `[data-theme="light"]`), `globals.css` (только импорты + базовый сброс).
- Добавил все семантические токены на OKLCH: background/foreground, card (+foreground), primary/secondary/muted/accent (+ каждому foreground), destructive (+foreground), border/input/ring + радиусы sm/md/lg + duration fast/base + ease-fast. Primary — оранжевый `oklch(0.72 0.18 50)`.
- Реализовал `useTheme()` в `src/shared/lib/theme`: читает DOM/data-theme, инициализируется из localStorage, прокидывает `theme`, `setTheme`, `toggle` и сразу синхронизирует dataset.theme и localStorage через `useEffect`.
- Добавил утилиту `cn(...inputs)` через `clsx + tailwind-merge` и публичный API слайса (`index.ts`).
- Сделал UI-компонент `ThemeToggle` (кнопка с Sun/Moon из `lucide-react`) в `src/shared/ui/theme-toggle/` с `ThemeToggle.types.ts` отдельным файлом и собственным stories-файлом.
- Добавил `theme.stories.tsx` со сценариями `Dark`, `Light`, `SideBySideAll` — отдельные изолированные контейнеры с data-theme, внутри каждого сватчи и три демо-кнопки для проверки работы утилит-классов.

## Acceptance criteria (отметить выполненные)
- [x] Tailwind-класс `bg-background`, `text-foreground`, `bg-primary` работает.
- [x] `[data-theme="light"]` переключает фон/цвет через CSS-переменные.
- [x] По умолчанию (без атрибута) применяется dark-палитра.
- [x] `useTheme()` переключает тему мгновенно без перезагрузки.
- [x] Сборка story показывает 3 примера: light/dark/side-by-side.

## Заметки для ревьюера
- Persist пока через `localStorage` (ключ `git-pawl.theme`) — переезд на `electron-store` запланирован в TASK-012, как и указано в задании.
- В `theme.stories.tsx` `Meta` без generic — все stories используют render-функции и не зависят от args, типизация проходит `tsc` без замечаний.
- `src/shared/lib/theme` намеренно лежит в `shared/lib`, а не в `features/theme-toggle`: переключение темы — кросс-приложение, относится к фундаменту, а не к пользовательской фиче (в духе FSD).
- `index.html` уже содержал `<html lang="en" data-theme="dark">` (был сделан в TASK-000), оставил как есть.
