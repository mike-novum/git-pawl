# TASK-006 — Storybook сборка

## Цель
Полностью настроенный Storybook для UI-кита и виджетов.

## Что сделать

1. `.storybook/main.ts` — registers `src/**/*.stories.@(ts|tsx)`.
2. `.storybook/preview.ts`:
   - глобальные декораторы (ThemeProvider, MemoryRouter если нужен)
   - `parameters.backgrounds.disable = false`
   - тёмная тема по умолчанию
3. Скрипт `npm run storybook` уже создан в TASK-000, проверить.
4. Скрипт `npm run build-storybook` для статической сборки.
5. README в `.storybook/README.md` описывает как писать истории.

## Acceptance criteria
- [x] `npm run storybook` запускается, видны все истории из TASK-002..004.
- [x] Переключение темы в toolbar работает.
- [x] Размер бандла разумный (≤ 8 MB JS).
- [x] TSC чисто.

## Зависит от
- TASK-002..004

## Параллелизация
Можно делать параллельно с TASK-010.

## Status ✅

Готово. Реализовано:

- `.storybook/main.ts` без изменений — авто-дискавери `src/**/*.stories.@(ts|tsx)`.
- `.storybook/preview.tsx` (мигрирован из `.ts`, чтобы esbuild обрабатывал JSX):
  - глобальный декоратор `withTheme` оборачивает истории в `ThemeProvider` + `ThemeRoot`,
    который синхронизирует `document.documentElement[data-theme]` с глобалом `theme`;
  - `globalTypes.theme` — тулбар с пунктами `Dark` / `Light`, по умолчанию `dark`;
  - `parameters.backgrounds.disable = false`, значения фонов подобраны под CSS-переменные;
  - `initialGlobals.theme = 'dark'` — тёмная тема по умолчанию.
- `.storybook/ThemeRoot.tsx`, `.storybook/types.ts` — вынесены отдельно ради `react-refresh/only-export-components`.
- `.storybook/README.md` — инструкция по написанию историй (FSD-расположение, `title`, декораторы, тема).
- Скрипты `npm run storybook` и `npm run build-storybook` подтверждены.

Проверки:

- `npm run storybook dev` поднимается за ~100 ms, отдаёт 30+ историй.
- `npm run build-storybook` собирает `storybook-static` (~4.3 MB общий, **0.99 MB JS** — под лимит 8 MB).
- `npm run tsc` чисто.
- `eslint .storybook/` чисто.
