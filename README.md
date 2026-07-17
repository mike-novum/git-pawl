# git-pawl

GUI-клиент для Git и удалённых репозиториев под macOS — Electron + React + TypeScript.

## Стек

- Electron 33 + electron-vite (main / preload / renderer)
- React 18 + TypeScript 5 (strict)
- Vite 5 + Tailwind CSS v4
- Base UI (`@base-ui/react`) + Shadcn-стиль UI-кит, `lucide-react` иконки
- TanStack Query (server state), Zustand (client state), React Router
- react-hook-form + zod (формы / валидация)
- Storybook 8 (UI-доки), Vitest + Testing Library (тесты), ESLint + Prettier (качество кода)
- Octokit / `@gitbeaker/node` для интеграций с GitHub/GitLab, electron-store для персистентных настроек

Слои и сегменты организованы по FSD (`app → pages → widgets → features → entities → shared`).
Архитектурные детали — в [`docs/architecture/architecture.md`](docs/architecture/architecture.md),
регламент правил — в [`AGENTS.md`](AGENTS.md).

## Скрипты

| Скрипт | Что делает |
| --- | --- |
| `npm run dev` | Запускает Electron-приложение в dev-режиме с hot-reload через `electron-vite`. |
| `npm run build` | Собирает main / preload / renderer бандлы в `out/` (`build:icon` → `electron-vite build`). Артефакты готовы к упаковке. |
| `npm run dist` | Полный релиз: `build` + `electron-builder` (`.dmg` / `.exe` / `.AppImage` в зависимости от платформы). |
| `npm run start` | Превью собранного приложения (`electron-vite preview`). |
| `npm run test` | Прогоняет тесты Vitest в single-run режиме (`vitest run`). |
| `npm run test:watch` | Vitest в watch-режиме. |
| `npm run tsc` | Type-check двух tsconfig: корневой рендерер + `electron/tsconfig.json`. |
| `npm run lint` | ESLint по всему проекту. |
| `npm run lint:fix` | ESLint с авто-фиксами. |
| `npm run storybook` | Запускает Storybook на `http://localhost:6006`. |
| `npm run build-storybook` | Собирает статический Storybook-бандл. |

## Запуск в dev

```bash
# 1. Установить зависимости
npm install

# 2. Запустить dev-режим (Electron с hot-reload)
npm run dev
```

Зависимости должны быть в `node_modules/`. После установки убедитесь, что:

- Node.js ≥ 20 (используется в `electron` 33 и `@types/node` 22).
- macOS (целевая платформа); запуск на Linux/Windows возможен, но не основной сценарий.

Полезные доп. команды:

```bash
npm run tsc        # проверка типов
npm run lint       # линт
npm run test       # тесты
npm run storybook  # UI-доки на http://localhost:6006
```

## Сборка дистрибутива

```bash
npm run dist        # полная сборка .dmg / .exe / .AppImage
npm run dist:mac    # только macOS (.dmg)
```

Артефакты `electron-builder` складывает в `dist/` (по умолчанию).
Подпись/нотаризация не настроены — публикуется как unsigned-сборка;
для подписи добавьте сертификаты и параметры `mac` в секцию `build`
`package.json` (см. документацию `electron-builder`).

## Структура проекта

```
electron/   # main и preload процессы Electron, IPC, сервисы (git, fs, store, git-host)
src/        # рендерер: app → pages → widgets → features → entities → shared
docs/       # архитектура, планы, список задач (TASK-NNN)
build/      # иконки приложения, генерируемые скриптом `build:icon`
scripts/    # утилитарные скрипты сборки (build-icon и т.п.)
```

## Лицензия

MIT — см. `package.json`.
