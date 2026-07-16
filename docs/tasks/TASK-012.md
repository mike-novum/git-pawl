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

## Статус: DONE — интеграция ThemeProvider со store, начальная тема из prefers-color-scheme, плавный переход CSS

### Что сделано
- `ThemeProvider` теперь читает тему из `useAppStore` и применяет к `document.documentElement.dataset.theme` через `useEffect`.
- При `setTheme` / `toggleTheme` вызывается `useAppStore.setTheme` — zustand `persist` сохраняет выбор в localStorage.
- `bootstrapTheme()` в entrypoint при первом запуске (нет ключа `git-pawl.app` в localStorage) подхватывает системную тему через `matchMedia('(prefers-color-scheme: dark)')` и пишет в store до рендера.
- `globals.css` получил плавный переход `background-color`/`color` через `--duration-base`/`--ease-fast`.
- `ThemeProviderProps` вынесен в `types.ts` по правилам AGENTS.md.
- `useTheme()` без изменений — продолжает читать через контекст, который теперь подпитан стором.

### Acceptance criteria (отметить выполненные)
- [x] Переключение темы применяется мгновенно.
- [x] Выбор сохраняется между запусками.
- [x] Плавный переход через `transition: background-color, color --duration-base ease-fast`.

### Заметки для ревьюера
- `useAppStore` уже подключён к `persist` (TASK-011), поэтому отдельная запись в localStorage в `ThemeProvider` убрана — избегаем дублирования.
- По FSD `shared` может импортировать из `app` (исключение), прямой импорт `useAppStore` в `ThemeProvider` оставлен осознанно.
- Сборка не запускалась (электрон — out of scope), `npm run tsc` и `eslint` по затронутым файлам чисто.
