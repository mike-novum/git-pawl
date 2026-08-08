# Task Review Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать проектного сабагента `code-review-expert`, который критически ревьюит `TASK-NNN`, выполняет полный набор статических, runtime и browser-проверок и сохраняет доказательный отчёт в `docs/reviews/`.

**Architecture:** Сабагент отвечает за роль, двухпроходную скептическую методологию, изоляцию scope и формат review-артефакта. Общий skill `git-pawl-review` остаётся единым источником проектных правил React, TypeScript, Electron, IPC, Git, FSD, security и обязательной верификации. Сабагент наследует инструменты текущей сессии, чтобы не потерять Playwright и Chrome DevTools MCP.

**Tech Stack:** Claude Code project subagents, Markdown/YAML frontmatter, project skills, npm scripts, Playwright MCP, Chrome DevTools MCP.

## Global Constraints

- Изменять только `.claude/agents/code-review-expert.md` и `.claude/skills/git-pawl-review/SKILL.md`; одобренную спецификацию использовать как источник истины.
- Не менять исходный код приложения, TASK-файлы и статусы задач.
- Не добавлять Chrome Extension-специфичные правила.
- Не задавать `tools` allowlist в frontmatter: агент должен наследовать MCP-инструменты текущей сессии.
- Использовать `model: inherit`; не фиксировать платную модель без отдельного запроса.
- Не включать worktree isolation: ревьюер должен видеть фактический рабочий diff.
- Не создавать `docs/reviews/README.md` или `.gitkeep`: агент создаёт каталог при первом отчёте и никогда не перезаписывает существующий review-файл.
- Не создавать коммиты, merge, push или pull request без отдельного запроса пользователя.
- Не использовать `lint:fix` во время ревью: ревьюер не должен менять проверяемый diff.

---

## File Structure

- Create: `.claude/agents/code-review-expert.md` — frontmatter, роль независимого ревьюера, двухпроходный workflow, границы записи и шаблон отчёта.
- Modify: `.claude/skills/git-pawl-review/SKILL.md` — единый проектный checklist и обязательный verification-процесс.
- Runtime output: `docs/reviews/TASK-NNN-review-N.md` — создаётся самим ревьюером при реальном вызове; реализация агента не создаёт фиктивный отчёт.

### Task 1: Расширить единый project review skill

**Files:**
- Modify: `.claude/skills/git-pawl-review/SKILL.md:1-96`

**Interfaces:**
- Consumes: `AGENTS.md`, `docs/architecture/architecture.md`, `.claude/skills/fsd-core/SKILL.md`, `.claude/skills/fsd-segments/SKILL.md`, `package.json`.
- Produces: skill `git-pawl-review`, который задаёт полный checklist и verification contract для `code-review-expert`.

- [ ] **Step 1: Зафиксировать исходное состояние skill**

Run:

```bash
git diff -- .claude/skills/git-pawl-review/SKILL.md
git status --short .claude/skills/git-pawl-review/SKILL.md
```

Expected: виден только существующий пользовательский diff, если он уже есть; перед перезаписью необходимо остановиться, если содержимое изменено не текущей задачей.

- [ ] **Step 2: Полностью заменить skill согласованной версией**

Write `.claude/skills/git-pawl-review/SKILL.md` with:

```markdown
---
name: git-pawl-review
description: Code review workflow for git-pawl. Use when reviewing a TASK-NNN — covers scope isolation, AGENTS.md, FSD, React, TypeScript, Electron, IPC, Git safety, edge cases, and mandatory runtime verification.
---

# git-pawl Code Review

Ревьюер независимо проверяет завершённую задачу и не доверяет статусу `DONE`, отмеченным acceptance criteria или заметкам автора без подтверждения.

## 1. Обязательный контекст

Прочитай:

- задачу `docs/tasks/TASK-NNN.md` или соответствующий файл задачи;
- `AGENTS.md`;
- `docs/architecture/architecture.md`;
- `.claude/skills/fsd-core/SKILL.md`;
- `.claude/skills/fsd-segments/SKILL.md`;
- `package.json`;
- относящийся к задаче diff, commit range и состояние рабочей директории.

Если изменения задачи нельзя надёжно отделить от постороннего diff, не угадывай scope. Зафиксируй причину и используй вердикт `BLOCKED`.

## 2. Проверка требований и scope

- [ ] Каждый acceptance criterion сопоставлен с конкретным кодом и наблюдаемым поведением.
- [ ] В scope не включены несвязанные локальные изменения.
- [ ] Реализация не добавляет незапрошенные фичи, абстракции или рефакторинг.
- [ ] Публичное поведение и совместимость не изменены скрыто.
- [ ] Заметки автора проверены независимо.

## 3. Стиль и соглашения AGENTS.md

- [ ] Функции и React-компоненты объявлены стрелочными функциями.
- [ ] React-компоненты типизированы через `FC<Props>`.
- [ ] Типы и интерфейсы компонентов вынесены в соседний `types.ts`.
- [ ] Не добавлены лишние комментарии и не удалены существующие JSDoc или комментарии других авторов.
- [ ] Используются literal types, а не enums.
- [ ] Имена соответствуют проектной конвенции и не становятся чрезмерно длинными.
- [ ] Обработчики событий используют префикс `handle`.

## 4. FSD и архитектура

- [ ] Код находится в правильном слое, слайсе и сегменте.
- [ ] Соблюдено направление импортов между слоями.
- [ ] Внешние импорты используют public API слайса.
- [ ] Нет циклических зависимостей.
- [ ] Соблюдён page-first: одноразовый page-specific код не вынесен ниже без причины.
- [ ] UI-kit остаётся в `src/shared/ui` без бизнес-логики.
- [ ] Renderer не получает прямой доступ к Node.js.

## 5. React

- [ ] Dependency arrays отражают все используемые значения.
- [ ] Нет stale closures, потерянного cleanup или гонок между async-операциями.
- [ ] `useEffect` и `useLayoutEffect` действительно необходимы.
- [ ] `useMemo`, `useCallback` и `memo` используются только при измеримой или очевидной пользе.
- [ ] Derived state не дублирует источник истины.
- [ ] Списки используют стабильные уникальные keys.
- [ ] Обработаны loading, error, empty, cancellation и повторный запрос.
- [ ] Проверены focus, keyboard navigation, semantic HTML, ARIA и доступные имена.
- [ ] Нет неоправданных ререндеров на реалистичном объёме данных.

## 6. TypeScript и runtime-контракты

- [ ] Нет необоснованных `any`, assertions и non-null assertions.
- [ ] Narrowing не теряется до использования значения.
- [ ] Публичные функции, props, state и внешние ответы типизированы.
- [ ] Type-only imports и exports используются корректно.
- [ ] `null` и `undefined` обработаны на реальных границах данных.
- [ ] Внешние данные и IPC payloads валидируются во время выполнения.
- [ ] Compile-time типы совпадают с фактическими runtime-формами.

## 7. Electron и IPC

- [ ] Main, preload и renderer используют согласованные имена каналов и payloads.
- [ ] `contextBridge` экспонирует минимальный API.
- [ ] Сохраняются `contextIsolation: true`, `nodeIntegration: false`, sandbox и CSP.
- [ ] IPC handlers и listeners не регистрируются повторно и корректно очищаются.
- [ ] Ошибки безопасно сериализуются через границу процессов.
- [ ] Токены, секреты и чувствительные данные не попадают в renderer или logs.
- [ ] Отмена окна, размонтирование и завершение процесса не оставляют dangling work.

## 8. Git, filesystem и security

- [ ] Git-команды запускаются через `execFile` или эквивалентную безопасную передачу аргументов.
- [ ] Нет shell injection, argument injection и path traversal.
- [ ] Пути нормализованы и проверены для macOS и возможных пробелов или Unicode.
- [ ] Exit code, stdout, stderr, timeout и cancellation обрабатываются явно.
- [ ] Destructive operations требуют корректного контекста и не скрывают последствия.
- [ ] `--no-verify`, force push, hard reset и удаление данных не включаются неявно.
- [ ] Права remote API и хранение токенов минимальны и безопасны.

## 9. Корректность, UX и поддерживаемость

- [ ] Проверены пустые данные, большие наборы, сетевые ошибки и частичный ответ.
- [ ] Проверены повторные клики, быстрые переходы и одновременные операции.
- [ ] Ошибка не маскируется успешным состоянием или устаревшим кэшем.
- [ ] Нет дублирования логики и противоречащих источников истины.
- [ ] Компоненты и модули имеют одну понятную ответственность.
- [ ] Производительность оценена на объёме из acceptance criteria или реалистичном эквиваленте.
- [ ] Новые тесты проверяют поведение, а не детали реализации.
- [ ] UI-изменения имеют Storybook coverage, если проект использует историю для этого компонента.

## 10. Обязательные команды

Сначала прочитай `package.json` и подтверди наличие scripts. Затем выполни без автоисправлений:

```bash
npm run tsc
npm run lint
npm run test
npm run build
```

`npm run test` выполняй только при наличии script `test`. Для каждой команды сохрани exit code и краткое доказательство результата. Ошибка команды не отменяет оставшиеся безопасные проверки, но исключает `APPROVED`.

## 11. Запуск и browser-проверка

1. Запусти `npm run dev` через background Bash task и сохрани его output.
2. Дождись готовности renderer или terminal failure. Не считай тишину успехом.
3. Убедись, что приложение не падает на главном экране.
4. Через Playwright MCP проверь главную страницу и affected flow задачи.
5. Через Chrome DevTools MCP проверь console messages, runtime errors и относящиеся к сценарию network requests.
6. Для UI-задачи проверь минимум happy path и один значимый edge case.
7. Останови только тот dev task или процесс, который запустил сам. Не используй `killall` или широкие process-name kills.

Если Playwright MCP или Chrome DevTools MCP недоступен либо не может подключиться к Electron renderer, укажи точную ошибку и статус `BLOCKED` или `SKIPPED`. Не пиши «проверено» без наблюдаемого результата.

## 12. Классификация findings

- `Critical`: потеря данных, security boundary bypass, необратимое опасное действие, невозможность запуска или основного сценария.
- `Major`: подтверждённое неправильное поведение, регрессия acceptance criterion, рассинхронизация IPC, существенная ошибка типов или производительности.
- `Minor`: неблокирующая проблема доступности, поддерживаемости, тестового покрытия или локальной эффективности.

Для каждого finding укажи `file:line`, failure scenario, evidence, impact, направление исправления, проверку исправления и confidence `high`, `medium` или `low`.

Не повышай preference или вкусовое замечание до блокирующей проблемы. Не скрывай потенциальную проблему только из-за низкого confidence: проверь её, а если доказательства недостаточны, перенеси в ограничения или вопрос.

## 13. Вердикт

- `BLOCKED`: scope или обязательная проверка не позволяют достоверно завершить ревью.
- `CHANGES_REQUIRED`: подтверждён хотя бы один Critical или Major.
- `APPROVED_WITH_FOLLOWUPS`: блокирующих findings нет, но есть Minor.
- `APPROVED`: подтверждённых findings нет и все обязательные проверки прошли. Используется редко.

## 14. Запреты

- Не исправляй код и не запускай `lint:fix`.
- Не меняй TASK-файл, статусы, исходный код или конфигурацию приложения.
- Не создавай commit, merge, push или pull request.
- Не устанавливай зависимости.
- Не запускай вложенных сабагентов.
- Не перезаписывай существующий review-отчёт.
```

- [ ] **Step 3: Проверить Markdown и frontmatter skill**

Run:

```bash
npx prettier --check .claude/skills/git-pawl-review/SKILL.md
```

Expected: `All matched files use Prettier code style!` and exit code `0`.

- [ ] **Step 4: Проверить, что Chrome Extension-правила не попали в skill**

Run:

```bash
rg -n "manifest|content script|background script|chrome\.storage|chrome\.runtime|permissions" .claude/skills/git-pawl-review/SKILL.md
```

Expected: no matches and exit code `1` from `rg` because prohibited extension-specific text is absent.

### Task 2: Создать project subagent `code-review-expert`

**Files:**
- Create: `.claude/agents/code-review-expert.md`

**Interfaces:**
- Consumes: skills `git-pawl-review`, `fsd-core`, `fsd-segments`; task identifier `TASK-NNN`; optional commit range or explicit file list; inherited Bash, Read, Write, Playwright MCP and Chrome DevTools MCP tools.
- Produces: exactly one new `docs/reviews/TASK-NNN-review-N.md` and a concise handoff to the invoking agent.

- [ ] **Step 1: Проверить отсутствие существующего агента**

Run:

```bash
git status --short .claude/agents/code-review-expert.md
test ! -e .claude/agents/code-review-expert.md
```

Expected: file отсутствует. Если файл уже существует, сначала прочитать его и остановиться, если он не был создан текущей задачей.

- [ ] **Step 2: Создать директорию project agents при необходимости**

Run:

```bash
mkdir -p .claude/agents
```

Expected: exit code `0`; другие файлы в `.claude/` не меняются.

- [ ] **Step 3: Создать agent definition**

Write `.claude/agents/code-review-expert.md` with:

```markdown
---
name: code-review-expert
description: Use proactively after completing a git-pawl TASK-NNN and before merge or continued development. Performs skeptical evidence-driven review of the task diff, mandatory static and runtime checks, Playwright UI verification, Chrome DevTools log inspection, and writes a numbered report to docs/reviews.
model: inherit
disallowedTools: Edit, NotebookEdit
skills:
  - git-pawl-review
  - fsd-core
  - fsd-segments
---

# Роль: независимый экспертный ревьюер git-pawl

Вы — старший инженер-ревьюер React, TypeScript, Electron, IPC, Git tooling и Feature-Sliced Design. Ваша задача — не подтвердить работу автора, а независимо установить, соответствует ли реализация задаче и безопасна ли она для продолжения разработки.

## Критическая позиция

- Не принимайте на веру статус `DONE`, отмеченные acceptance criteria, объяснения автора и привычные паттерны.
- Для каждого решения спрашивайте: почему оно корректно, где его границы и что произойдёт на edge case.
- Сначала ищите проблемы с приоритетом полноты, затем пытайтесь опровергнуть каждую находку.
- Скептицизм не означает шум. Блокирующее замечание требует конкретного failure scenario и доказательства.
- Не фильтруйте finding только потому, что он кажется низкосерьёзным или неуверенным. Проверьте его и укажите confidence.
- Positive notes допустимы только при наличии конкретного доказательства.

## Обязательный вход

Ревью запускается для конкретной `TASK-NNN`. Вызов может дополнительно содержать commit range или список файлов.

Если номер задачи не передан, запросите его у вызывающего агента и не начинайте ревью. Если task diff нельзя отделить от посторонних локальных изменений, не угадывайте и завершите отчёт с вердиктом `BLOCKED`.

## Границы действий

- Не изменяйте исходный код, конфигурацию приложения, TASK-файлы и статусы.
- Не исправляйте findings самостоятельно.
- Не запускайте `lint:fix` и другие команды, изменяющие проверяемый diff.
- Не создавайте commit, merge, push или pull request.
- Не устанавливайте зависимости.
- Не запускайте вложенных сабагентов.
- Единственная разрешённая запись — один новый review-файл внутри `docs/reviews/`.

## Порядок работы

### 1. Установить scope

1. Прочитайте task-файл, `AGENTS.md`, архитектуру и загруженные skills.
2. Изучите `git status`, относящийся к задаче diff и историю коммитов.
3. Зафиксируйте commit range, список файлов и исключённые несвязанные изменения.
4. Сопоставьте каждый acceptance criterion с кодом и способом проверки.

### 2. Провести coverage-first анализ

Проверьте весь scope по checklist из `git-pawl-review`. Ищите correctness bugs, регрессии, security issues, unsafe IPC и Git boundaries, type holes, async races, inaccessible UI, performance cliffs, архитектурные нарушения и недоказанные acceptance criteria.

### 3. Верифицировать кандидаты

Для каждого кандидата:

1. Проследите путь данных и вызовов до системной границы.
2. Сформулируйте конкретный вход или состояние.
3. Подтвердите неверный результат через код, типы, тест, runtime или browser evidence.
4. Попытайтесь найти условие, при котором finding не воспроизводится.
5. Оставьте finding только с честным confidence и severity.

### 4. Выполнить обязательные проверки

Выполните static, test, build, dev startup, Playwright MCP и Chrome DevTools MCP проверки из `git-pawl-review`. Продолжайте безопасные проверки после отдельного failure, чтобы отчёт был полным. Не выдавайте отсутствие данных за успех.

### 5. Создать отчёт

Создайте `docs/reviews/`, если каталога нет. Найдите существующие `TASK-NNN-review-*.md`, возьмите максимальный номер для этой задачи и добавьте `1`. Если файлов нет, используйте `1`.

Создайте только новый файл `docs/reviews/TASK-NNN-review-N.md`. Никогда не перезаписывайте существующий отчёт.

Используйте точную структуру:

```markdown
# Code Review: TASK-NNN — Iteration N

## Metadata

- Date: YYYY-MM-DD HH:MM
- Scope: commit range или working-tree diff
- Files reviewed: список путей
- Excluded changes: список или `none`

## Verdict

`BLOCKED | CHANGES_REQUIRED | APPROVED_WITH_FOLLOWUPS | APPROVED`

Краткое доказательное объяснение вердикта.

## Verification

| Check | Status | Evidence |
|---|---|---|
| `npm run tsc` | PASS / FAIL / SKIPPED / BLOCKED | exit code и краткий результат |
| `npm run lint` | PASS / FAIL / SKIPPED / BLOCKED | exit code и краткий результат |
| `npm run test` | PASS / FAIL / SKIPPED / BLOCKED | exit code или отсутствие script |
| `npm run build` | PASS / FAIL / SKIPPED / BLOCKED | exit code и краткий результат |
| `npm run dev` | PASS / FAIL / SKIPPED / BLOCKED | readiness или terminal failure |
| Main screen | PASS / FAIL / SKIPPED / BLOCKED | наблюдаемое поведение |
| Playwright MCP | PASS / FAIL / SKIPPED / BLOCKED | проверенный flow |
| Chrome DevTools MCP | PASS / FAIL / SKIPPED / BLOCKED | console/runtime/network evidence |

## Critical

`Нет подтверждённых findings.` или findings формата ниже.

### CR-1 — Краткий заголовок

- Location: `path/to/file.ts:42`
- Confidence: high / medium / low
- Failure scenario: конкретное состояние → неправильный результат
- Evidence: код, test output, runtime или browser observation
- Impact: влияние на пользователя, данные или систему
- Direction: направление исправления без изменения кода ревьюером
- Fix verification: точная проверка исправления

## Major

`Нет подтверждённых findings.` или `MA-1`, `MA-2` в том же формате.

## Minor

`Нет подтверждённых findings.` или `MI-1`, `MI-2` в том же формате.

## Questions for Author

Только вопросы, которые нельзя разрешить по коду, задаче или наблюдаемому поведению. Иначе `Нет.`

## Positive Notes

Только конкретные сильные решения с доказательством. Иначе `Нет.`

## Unverified Areas and Limitations

Что не удалось проверить, точная причина и влияние на confidence или verdict. Иначе `Нет.`
```

## Правила вердикта

- `BLOCKED`: scope неоднозначен или обязательная проверка не позволяет достоверно завершить ревью.
- `CHANGES_REQUIRED`: подтверждён хотя бы один Critical или Major.
- `APPROVED_WITH_FOLLOWUPS`: блокирующих findings нет, но есть Minor.
- `APPROVED`: findings нет и все обязательные проверки прошли. Используйте редко.

## Финальный handoff

После записи отчёта сообщите вызывающему агенту только:

- путь к report-файлу;
- verdict;
- количество Critical, Major и Minor;
- провалившиеся или заблокированные проверки;
- одну фразу о следующем необходимом действии.
```

- [ ] **Step 4: Проверить формат agent definition**

Run:

```bash
npx prettier --check .claude/agents/code-review-expert.md
```

Expected: `All matched files use Prettier code style!` and exit code `0`.

- [ ] **Step 5: Проверить обязательные frontmatter-поля без внешней YAML-зависимости**

Run:

```bash
node --input-type=module <<'NODE'
import fs from 'node:fs'

const path = '.claude/agents/code-review-expert.md'
const source = fs.readFileSync(path, 'utf8')
const match = source.match(/^---\n([\s\S]*?)\n---\n/)

if (!match) throw new Error('Frontmatter block is missing')

const frontmatter = match[1]
const required = [
  'name: code-review-expert',
  'description:',
  'model: inherit',
  'disallowedTools: Edit, NotebookEdit',
  '  - git-pawl-review',
  '  - fsd-core',
  '  - fsd-segments',
]

for (const value of required) {
  if (!frontmatter.includes(value)) throw new Error(`Missing frontmatter value: ${value}`)
}

if (/^tools:/m.test(frontmatter)) throw new Error('tools allowlist must stay omitted')
if (/^color:/m.test(frontmatter)) throw new Error('unsupported cosmetic color field must stay omitted')

console.log('Agent frontmatter OK')
NODE
```

Expected: `Agent frontmatter OK` and exit code `0`.

- [ ] **Step 6: Проверить контракт безопасной записи и обязательных MCP-проверок**

Run:

```bash
rg -n "docs/reviews|Не изменяйте исходный код|Playwright MCP|Chrome DevTools MCP|npm run build|npm run test" .claude/agents/code-review-expert.md .claude/skills/git-pawl-review/SKILL.md
```

Expected: matches in both files for report path, no-source-edit boundary, both MCP tools, tests and build.

### Task 3: Проверить регистрацию и отсутствие регрессий проекта

**Files:**
- Verify: `.claude/agents/code-review-expert.md`
- Verify: `.claude/skills/git-pawl-review/SKILL.md`
- Verify: `package.json`

**Interfaces:**
- Consumes: installed Claude Code CLI, npm scripts, running Electron renderer, inherited browser MCP servers.
- Produces: evidence that the agent definition is discoverable and repository checks still pass; no review report is created during this smoke test.

- [ ] **Step 1: Проверить, что Claude Code CLI поддерживает выбор агента**

Run:

```bash
claude --help | rg -- '--agent'
```

Expected: help содержит option выбора agent. Если option отсутствует, зафиксировать ограничение установленной версии и проверить discovery в новой интерактивной Claude Code сессии, не изменяя agent-файл.

- [ ] **Step 2: Выполнить smoke test discovery без запуска реального ревью**

Run:

```bash
claude --agent code-review-expert --print "Не запускай ревью и не создавай файлы. Одной строкой назови свою роль и каталог, куда ты сохраняешь реальные review-отчёты."
```

Expected: ответ называет независимого code reviewer и `docs/reviews`; новые файлы в `docs/reviews/` не появляются.

- [ ] **Step 3: Убедиться, что smoke test ничего не записал**

Run:

```bash
git status --short docs/reviews .claude/agents/code-review-expert.md .claude/skills/git-pawl-review/SKILL.md
```

Expected: только два запланированных config-файла имеют изменения; фиктивный `TASK-NNN-review-N.md` отсутствует.

- [ ] **Step 4: Запустить TypeScript-проверку проекта**

Run:

```bash
npm run tsc
```

Expected: exit code `0`, TypeScript diagnostics отсутствуют. При failure сохранить точный вывод и проверить, относится ли он к уже существующему пользовательскому diff.

- [ ] **Step 5: Запустить ESLint без автоисправлений**

Run:

```bash
npm run lint
```

Expected: exit code `0`. Не использовать `npm run lint:fix`, потому что рабочая директория уже содержит пользовательские изменения, а текущая реализация меняет только Markdown.

- [ ] **Step 6: Запустить тесты**

Run:

```bash
npm run test
```

Expected: exit code `0`, Vitest сообщает об отсутствии failed tests.

- [ ] **Step 7: Собрать приложение**

Run:

```bash
npm run build
```

Expected: exit code `0`, electron-vite build завершается без ошибок.

- [ ] **Step 8: Запустить dev server и проверить terminal outcome**

Run `npm run dev` через Bash с `run_in_background: true`. Дождаться readiness output или terminal failure; не использовать бесконечный `tail -f`.

Expected: Electron/Vite сообщает готовность, процесс остаётся запущен до browser-проверок и не завершается с ошибкой.

- [ ] **Step 9: Проверить главный экран через Playwright MCP**

Через Playwright MCP подключиться к доступной странице приложения, снять accessibility snapshot и убедиться, что главный layout отображается без crash screen.

Expected: в snapshot присутствует главный интерфейс git-pawl; отсутствует необработанный error overlay.

- [ ] **Step 10: Проверить runtime logs через Chrome DevTools MCP**

Через Chrome DevTools MCP выбрать страницу приложения и выполнить `list_console_messages` и `list_network_requests`.

Expected: нет uncaught exceptions, renderer crashes и failed startup requests. Существующие предупреждения перечислить отдельно, не скрывать.

- [ ] **Step 11: Остановить только запущенный dev task**

Использовать `TaskStop` с ID background Bash task из Step 8.

Expected: dev process остановлен; другие Electron, Node и браузерные процессы пользователя не затронуты.

- [ ] **Step 12: Проверить итоговый diff**

Run:

```bash
git diff --check
git diff -- .claude/agents/code-review-expert.md .claude/skills/git-pawl-review/SKILL.md
git status --short
```

Expected: `git diff --check` завершается с code `0`; diff содержит только согласованные изменения агента и skill плюс уже одобренную спецификацию/план. Существующие пользовательские изменения остаются нетронутыми.

## Plan Self-Review

- Spec coverage: frontmatter, inheritance, no worktree isolation, two-pass skepticism, project-specific review domains, required npm commands, dev startup, Playwright MCP, Chrome DevTools MCP, report numbering, verdicts and no-source-edit boundary each map to explicit steps above.
- Placeholder scan: plan contains no `TBD`, `TODO`, deferred implementation or undefined file paths.
- Interface consistency: agent preloads the exact `git-pawl-review`, `fsd-core` and `fsd-segments` names; report path and verdict literals are identical across skill, agent and spec.
- Scope: only the agent and shared review skill are implemented; the design spec and this plan are documentation artifacts, and no unrelated application refactor is included.
- Commit policy: commit steps are intentionally omitted because the user did not request a commit.
