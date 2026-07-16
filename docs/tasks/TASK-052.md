# TASK-052 — Feature: clone-repo (из списка аккаунта)

## Цель
Клонирование из списка репо подключённого аккаунта.

## Что сделать
1. Расширение CloneByUrlForm или отдельный CloneFromAccountDialog:
   - Аккаунт → список репо (использует TASK-050).
   - Кнопка "Clone" на каждом репо.
2. Storybook story.

## Acceptance criteria
- [ ] Список подгружается по выбранному аккаунту.
- [ ] Клонирует в активный workspace.

## Зависит от
- TASK-050, TASK-051
