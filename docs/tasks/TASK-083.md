# TASK-083 — Widget: commit-message-form

## Цель
Редактор commit message с раздельными полями.

## Что сделать
1. Поля:
   - Header (subject) — одна строка, ≤ 72 символов, с подсветкой лимита.
   - Body — multiline textarea.
   - Footer — multiline textarea (для breaking change, etc.).
2. Preview собранного сообщения.
3. Кнопка «Commit» вызывает commit-changes (TASK-084).
4. Чекбокс «Bypass hooks» (TASK-069).
5. Кнопка «Amend» (TASK-066).

## Acceptance criteria
- [x] Валидация: header не пустой, ≤ 72 символов (визуально подсветить).
- [x] Структура message соответствует Conventional Commits (опционально, если не указано).

## Что сделано
- Создан виджет `src/widgets/commit-message-form/` со следующей структурой:
  - `index.ts` — публичный API слайса.
  - `ui/index.ts` — публичный API сегмента `ui`.
  - `ui/types.ts` — `CommitMessage` и `CommitMessageFormProps`.
  - `ui/CommitMessageForm.tsx` — форма с тремя полями:
    - Header: single-line `Input` из `@/shared/ui` с лимитом 72 символов, `maxLength` на input, aria-invalid и счётчик `N / 72`, который окрашивается в красный при превышении лимита.
    - Body: multiline `<textarea>` с placeholder-ом про Conventional Commits.
    - Footer: multiline `<textarea>` для breaking change/ссылок.
  - Кнопка `Commit` вызывает `onCommit({ header, body?, footer? })`. `body`/`footer` опускаются, если пустые.
  - Чекбокс `Bypass hooks` рендерится при `showBypass`, вызывает `onBypassChange(checked)`.
  - Кнопка `Amend` рендерится при `showAmend`, вызывает `onAmend()`.
  - Submit-кнопка disabled при пустом/переполненном header или `isSubmitting`.
- Компонент типизирован через `FC<CommitMessageFormProps>`, состояние — локальные `useState`, `useEffect` не используется.
- Сторонние файлы не трогались.

## Зависит от
- TASK-002
