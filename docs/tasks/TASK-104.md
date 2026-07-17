# TASK-104 — Финальная сборка

## Что сделать
1. Сборка .dmg через electron-builder.
2. README.md — инструкции, скриншоты, dev-инструкции.
3. Подписать (если настроены credentials) или документировать unsigned-сборку.

## Acceptance criteria
- [ ] `npm run dist` создаёт `.dmg`.
- [ ] Размер разумный (< 200 MB).
- [ ] README содержит features + screenshots.

## Зависит от
- Все выше.

## Status

**Build: NOT passing** — `npm run build` собирает `out/main/index.js` и `out/preload/index.js`, но падает на renderer-bundle.

Причина — renderer через хуки `useRepository` / `useCreateWorkspaceFlow` импортирует node-only модули из renderer-достижимого слоя:

- `src/entities/repository/lib/detectRepos.ts` (`node:fs`, `node:path`)
- `src/entities/repository/lib/buildRepository.ts` (`node:crypto`, `node:path`)
- `src/entities/workspace/lib/scanRepos.ts` (`node:fs`, `node:path`)

Rollup выдаёт: `"promises" is not exported by "__vite-browser-external"`. Архитектурное решение (не входило в scope этой задачи): перенести эти файлы из `src/entities/*/lib/` под `electron/services/` или `electron/ipc/` и вызывать через preload-bridge, как остальные fs/git операции.

Дополнительно формальный AC-критерий `npm run dist` собирает `.dmg` не проверялся — без зелёного `build` `electron-builder` не запустить.

**README: добавлен** — `/Users/mikenovum/projects/git-pawl/README.md` (описание, стек, все скрипты, dev-инструкции).
