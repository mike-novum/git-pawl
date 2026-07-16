# Архитектура git-pawl

> GUI для работы с Git и удалёнными репозиториями (macOS).
> Стек: React + TypeScript + Electron + Vite + Shadcn (Base UI) + Storybook.

---

## 1. Цели и принципы

- **Код организован по FSD** (см. `.claude/skills/fsd-core`). Слои: `app → pages → widgets → features → entities → shared`.
- **UI-кит изолирован в `src/shared/ui`** — компоненты без бизнес-логики, на базе Shadcn (Base UI).
- **Дизайн-токены описаны как семантические CSS-переменные** в Tailwind v4 через `@theme`. Темы переключаются через атрибут `data-theme="dark|light"` на `<html>`. Tailwind v4 это полностью поддерживает, никакой другой инструмент не нужен.
- **Темная тема по умолчанию**, светлая — опционально. Основной акцент — оранжевый.
- **Анимации короткие и плавные** (≈120–180 ms), через CSS-переменные `--ease-fast` и `--duration-fast`, чтобы не тормозить пользователя.
- **Иконка приложения** — оранжевая лапа кота в сметане (генерируем SVG-исходник + PNG `.icns`/`.png` через `png2icons` или `@img/sharp`).

---

## 2. Структура проекта

```
git-pawl/
├── electron/                # main и preload процессы Electron
│   ├── main/
│   │   ├── index.ts
│   │   ├── ipc/             # каналы IPC
│   │   └── services/        # git, fs, store, git-host
│   ├── preload/
│   │   └── index.ts
│   └── tsconfig.json
├── src/                     # рендерер (React)
│   ├── app/                 # App-layer
│   │   ├── providers/
│   │   ├── routes/
│   │   ├── store/
│   │   ├── styles/
│   │   └── entrypoint/
│   ├── pages/
│   ├── widgets/
│   ├── features/
│   ├── entities/
│   └── shared/
│       ├── ui/              # UI-кит
│       ├── api/             # API-клиент к preload
│       ├── lib/             # утилиты
│       └── config/
├── .storybook/
├── docs/
├── AGENTS.md
└── package.json
```

---

## 3. Слои FSD — слайсы

### 3.1 Entities

| Слайс | Назначение |
|---|---|
| `workspace` | Рабочее пространство: директория на диске, набор репозиториев |
| `repository` | Локальный репозиторий: путь, метаданные, иконка, размер |
| `account` | Аккаунт Git-хостинга (GitHub/GitLab), токены, scopes |
| `commit` | Коммит: hash, message (header/body/footer), author, date, parents |
| `branch` | Ветка: name, upstream, HEAD |
| `tag` | Тег: name, target, тип (lightweight/annotated) |
| `stash` | Запись stash: message, files, branch |
| `patch` | Патч: файл `.patch`/`.diff`, описание |
| `file-change` | Изменение файла: статус (M/A/D/...), old/new path, diff |

### 3.2 Features

| Слайс | Действие |
|---|---|
| `auth-login` | Подключение аккаунта (OAuth/PAT), сохранение токена |
| `auth-switch` | Переключение активного аккаунта |
| `clone-repo` | Клонирование по URL или выбор из списка аккаунта |
| `commit-changes` | Создание коммита (header/body/footer, выбор файлов, bypass hooks) |
| `git-pull` / `git-push` / `git-fetch` | Сетевые операции |
| `git-stash` | push/pop/apply/drop |
| `git-merge` / `git-rebase` / `git-reset` / `git-revert` / `git-amend` | История/перемещение |
| `create-patch` | Генерация патча из коммитов/диапазона |
| `manage-tags` | Создание/удаление тегов |
| `select-files` | Чекбоксы для включения файлов в коммит |
| `preview-diff` | Просмотр изменений по файлу |
| `search-repos` | Поиск по локальным репозиториям |
| `set-repo-icon` | Назначение иконки репозиторию |
| `bypass-hooks` | Флаг `--no-verify` |

### 3.3 Widgets

- `repository-tree` — список репозиториев в рабочем пространстве
- `commit-graph` — граф коммитов с авторами/датами/сообщениями
- `file-changes-panel` — список изменённых файлов с чекбоксами
- `commit-message-form` — редактор header/body/footer
- `branch-switcher` — переключение веток
- `account-switcher` — переключение аккаунтов
- `repo-header` — заголовок репозитория (иконка, имя, branch)
- `terminal-output` — вывод git-команд
- `workspace-switcher` — переключение рабочих пространств

### 3.4 Pages

- `workspace` — главная страница со списком репозиториев
- `repository` — страница одного репозитория (graph, changes, branches, tags)
- `accounts` — управление аккаунтами
- `settings` — глобальные настройки
- `clone` — мастер клонирования

---

## 4. Архитектура процессов Electron

```
┌────────────────────┐    IPC     ┌────────────────────┐
│ Renderer (React)   │◄──────────►│  Preload (bridge)  │
│ src/**             │            │  contextBridge     │
└────────────────────┘            └─────────┬──────────┘
                                            │ IPC
                                  ┌─────────▼──────────┐
                                  │  Main (Node.js)     │
                                  │  • git (child_proc) │
                                  │  • fs               │
                                  │  • store            │
                                  │  • git-host API     │
                                  └────────────────────┘
```

- **Renderer** не имеет прямого доступа к Node — только к `window.api` через `contextBridge` в preload.
- **Все git-операции** выполняются в main-процессе через `child_process.execFile('git', ...)` (никаких npm-обёрток вроде `simple-git` — лучше явные вызовы CLI с парсингом вывода).
- **Аутентификация**: PAT хранятся в `electron-store` (зашифрованном), OAuth-токены обмениваются через PKCE-flow с локальным HTTP-сервером на main.

---

## 5. Стек и зависимости

### Core
- `electron` + `electron-builder` (сборка `.dmg`)
- `vite` + `electron-vite` (шаблон с готовым HMR)
- `react` + `react-dom`
- `typescript`
- `eslint` v9 (flat config)

### UI
- `@base-ui/react` (новая основа Shadcn — заменяет Radix; бывший `@base-ui-components/react`)
- `tailwindcss` v4 (CSS-first config, дизайн-токены через `@theme`)
- `class-variance-authority` + `tailwind-merge` + `clsx`
- `lucide-react` (иконки)
- `motion` (`motion/react`, бывший framer-motion) — лёгкие анимации

### State / Data
- `zustand` — глобальное состояние (workspaces, accounts, текущий repo)
- `@tanstack/react-query` — серверное состояние (списки репо с GitHub/GitLab)
- `react-hook-form` + `zod` — формы и валидация

### Git / API
- `child_process` (встроено) — git CLI
- `@octokit/rest` — GitHub REST API
- `@gitbeaker/node` — GitLab API
- `electron-store` — настройки и токены

### Dev
- `storybook` v8
- `prettier`
- `vitest` + `@testing-library/react` — тесты
- `@img/sharp` — генерация иконки приложения
- `png2icons` — `.icns` для macOS

---

## 6. Темы и дизайн-токены

Tailwind v4 поддерживает дизайн-токены через `@theme` в CSS. Подход:

```css
/* src/app/styles/theme.css */
@import "tailwindcss";

@theme {
  --color-background: oklch(0.18 0.02 270);
  --color-foreground: oklch(0.95 0.01 270);
  --color-primary: oklch(0.72 0.18 50);          /* оранжевый */
  --color-primary-foreground: oklch(0.18 0.02 270);
  --color-muted: oklch(0.30 0.02 270);
  --color-muted-foreground: oklch(0.70 0.02 270);
  --color-border: oklch(0.35 0.02 270);
  --color-ring: oklch(0.72 0.18 50);

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  --duration-fast: 120ms;
  --duration-base: 180ms;
  --ease-fast: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="light"] {
  --color-background: oklch(0.99 0.005 270);
  --color-foreground: oklch(0.18 0.02 270);
  --color-muted: oklch(0.94 0.01 270);
  --color-muted-foreground: oklch(0.45 0.02 270);
  --color-border: oklch(0.88 0.01 270);
}
```

По умолчанию в `app/index.html` ставим `<html data-theme="dark">`. Переключение — через `useTheme()` хук + persist в `electron-store`.

> **Брейншторм по токенам:** Tailwind v4 с `@theme` + CSS-переменными полностью покрывает запрос на «семантические токены для светлой/тёмной темы». Дополнительные библиотеки (vanilla-extract, Stitches, Pico) не нужны — это лишний слой абстракции. Единственное — избегаем дублирования: все токены живут в одном `theme.css`, импортируются в `globals.css`.

---

## 7. Иконка приложения

- SVG-исходник `assets/icon.svg` — лапа кота, оранжевая, на белом/сметанном фоне.
- Скрипт `scripts/build-icon.ts` через `@img/sharp` + `png2icons` генерирует:
  - `build/icon.png` (512×512)
  - `build/icon.icns` (macOS)
  - `build/icon.ico` (Windows, опционально)
- В `electron/main/index.ts` устанавливаем `nativeImage.createFromPath('build/icon.png')` как `app.dock.setIcon(...)` и `BrowserWindow({ icon })`.

---

## 8. Хранение данных

- `electron-store` (зашифрованный) — глобальные настройки:
  - список workspace-ов и их путей
  - список аккаунтов и токенов
  - настройки темы, поведения
- Локальные данные репозитория — не дублируем, читаем через `git` CLI.
- Кеш списка репо с GitHub/GitLab — `electron-store`, TTL 5 минут.

---

## 9. Безопасность

- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`.
- CSP в HTML: `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:`.
- Все IPC-каналы валидируются через zod-схемы.
- Токены никогда не попадают в renderer — только флаг «залогинен» и `account.login`.

---

## 10. Тестирование

- `vitest` для unit-тестов утилит, git-парсеров, валидаторов.
- `@testing-library/react` для компонентов UI-кита (Storybook-истории тоже можно использовать как визуальные тесты через `play`).
- E2E (`playwright` + `_electron`) — для критических сценариев: clone → commit → push.

---

## 11. Источник истины для агентов

> **Все задачи и планы — в `docs/`.** Агент, берущий задачу, обязан:
> 1. Прочитать `docs/architecture/architecture.md` (этот файл).
> 2. Прочитать свою задачу в `docs/tasks/TASK-NNN-*.md`.
> 3. Следовать правилам из `AGENTS.md` и `.claude/skills/fsd-*`.
> 4. По окончании — обновить статус задачи и оставить diff.
