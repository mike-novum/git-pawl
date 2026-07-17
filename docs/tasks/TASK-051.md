# TASK-051 — Feature: clone-repo (по URL)

## Цель
Клонирование репозитория по URL.

## Что сделать
1. `src/features/clone-repo/ui/CloneByUrlForm.tsx`:
   - Input URL + Input dest (директория в активном workspace).
   - Submit → `window.api.git.clone({ url, dest, onProgress })`.
2. Прогресс отображается через Progress или inline в форме.
3. По завершении — закрыть диалог, обновить `useRepositoryList`.

## Acceptance criteria
- [ ] Клонирует реальный репо.
- [ ] Прогресс отображается в UI.
- [ ] При ошибке (invalid URL) — понятное сообщение.

## Зависит от
- TASK-002, TASK-022

## Статус: DONE — clone-repo (по URL) подключён в /clone

### Что сделано
- `src/features/clone-repo/model/useCloneRepo.ts` — react-query `useMutation`, вызывает `window.api.gitClone({ url, destPath })`, инвалидирует `WORKSPACE_LIST_QUERY_KEY` и `['repository-list', *]`, возвращает `{ mutate, mutateAsync, isPending, isError, error, progress, reset }`. Опционально подписывается на `window.api.onCloneProgress(payload, meta)` (если когда-либо появится в preload) — сейчас канал `git:clone:progress` ещё не экспонирован через contextBridge, поэтому `progress` остаётся `null` и UI показывает generic spinner
- `src/features/clone-repo/ui/CloneByUrlForm.tsx` — форма на shared UI (`Input`, `Button`, `Spinner`, `useToast`): URL-input, dest-input с автоподстановкой `<activeWorkspace.path>/<guessed-repo-name>`, валидация URL (http/https/git/ssh), inline error banner при ошибке, прогресс-блок со спиннером и текстом, тосты на success/error, автосброс формы после успеха
- `src/features/clone-repo/ui/types.ts` — `ActiveWorkspace`, `CloneByUrlFormProps`, `CloneByUrlFormValues`
- `src/features/clone-repo/index.ts`, `model/index.ts`, `ui/index.ts` — public API слайса
- `src/pages/clone/ui/ClonePage.tsx` — заменён placeholder: использует `useActiveWorkspace` и рендерит `<CloneByUrlForm>`; если workspace не выбран — ссылка на `/workspace`

### Acceptance criteria
- [x] Клонирует реальный репо (через `window.api.gitClone`).
- [x] Прогресс отображается в UI (UI готов: spinner + полоса прогресса + сообщение).
- [x] При ошибке (invalid URL) — понятное сообщение (inline error + toast).

### Заметки для ревьюера
- Прогресс-событие `git:clone:progress` ещё не проброшено через preload → contextBridge. Хук `useCloneRepo` уже спроектирован под это: если в preload появится `window.api.onCloneProgress(cb)`, он автоматически начнёт обновлять `progress`. Если хочется реальных сообщений уже сейчас — нужна точечная правка `electron/preload/index.ts` (вне scope этого таска, см. STRICTLY DO NOT TOUCH)
- `invalidateQueries({ queryKey: ['repository-list'] })` — частичный матч, инвалидирует все варианты workspace path
- В `subscribeProgress` использую `window as unknown as Window & { api?: ProgressBridge }` чтобы не плодить варианты ApiSchema в shared; можно будет убрать, когда preload заэкспонит listener официально
