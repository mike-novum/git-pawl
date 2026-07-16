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
- [ ] `npm run storybook` запускается, видны все истории из TASK-002..004.
- [ ] Переключение темы в toolbar работает.
- [ ] Размер бандла разумный (≤ 8 MB JS).
- [ ] TSC чисто.

## Зависит от
- TASK-002..004

## Параллелизация
Можно делать параллельно с TASK-010.
