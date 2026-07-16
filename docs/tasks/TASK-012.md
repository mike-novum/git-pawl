# TASK-012 — Переключение тем (интеграция с store)

## Цель
Theme переключатель записывает выбор в store и применяет его глобально.

## Что сделать

1. `useTheme()` из TASK-001 переписать на чтение из `useAppStore`.
2. При `setTheme('light')`:
   - обновляем store
   - `document.documentElement.dataset.theme = 'light'`
3. При первом запуске — читаем системную тему `prefers-color-scheme`.
4. UI-компонент `ThemeToggle` в `src/shared/ui/theme-toggle/` — кнопка с иконкой sun/moon.

## Acceptance criteria
- [ ] Переключение темы применяется мгновенно.
- [ ] Выбор сохраняется между запусками.
- [ ] Плавный переход через `transition: background-color, color --duration-base ease-fast`.

## Зависит от
- TASK-001, TASK-011
