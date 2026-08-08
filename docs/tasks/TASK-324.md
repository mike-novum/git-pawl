# TASK-324 — RepoDetailPanel: список изменённых файлов + форма коммита

## Контекст

Из фидбэка пользователя (roadmap-9, баг #6): на странице репо есть правая панель (`RepoDetailPanel`), в ней сейчас ничего не отображается кроме кнопок stash/commit. Надо:
- показывать список изменённых файлов выбранного коммита (по клику на коммит в графе).
- убрать кнопку stash полностью.
- показывать поле для ввода commit message + кнопку Commit только когда выбран "Uncommited Changes" в графе.
- список файлов должен уметь вертикально прокручиваться.
- форма commit message (textarea + кнопка) не больше 250px по высоте.

## Корневая причина

Файл: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx`.

Текущая панель:
- если `commit` есть — рендерит информацию о коммите + кнопки Patch/Cherry-pick/Revert/Reset + footer с Uncommitted counter + Stash/Commit/Discard.
- если `commit` нет — рендерит footer только с Uncommitted counter + Stash/Commit.

Не реализовано:
- Получение файлов для выбранного коммита.
- Отображение списка файлов в основной области панели.
- Специальное представление "Uncommited Changes" (call to commit).

## Что сделать

### Шаг 1. Расширить тип `CommitNode`

Файл: `src/widgets/repo-graph-vertical/types.ts`:
- Добавить `kind?: 'commit' | 'uncommitted'` (если ещё нет специального представления).
- Для uncommitted-ноды используем `hash = 'UNCOMMITTED'`, `subject = 'Uncommited changes'`, `parents = []`, `lane = 0` (или `-1`).

### Шаг 2. Entity: получение файлов коммита

Файл: `src/entities/file-change/api/fileChangeApi.ts`:
- Уже есть `useFileChanges` (или похожее). Проверить, есть ли `git show --name-status --pretty=format:` для получения файлов КОММИТА (не working tree).

Если нет — добавить:
- `fetchCommitFiles(repoPath, commitHash)` — вызывает `git show --name-status --pretty=format:` и парсит.

Файл: `src/entities/file-change/model/fileChangeQueries.ts` (или новый):
- `useCommitFiles(repoPath, commitHash)` — `useQuery` с `queryKey: ['commit-files', repoPath, commitHash]`.

### Шаг 3. Переработать RepoDetailPanel

Файл: `src/widgets/repo-detail-panel/types.ts`:
- Изменить props:
  - убрать `onStash`, `onDiscard` (stash больше не показывается).
  - `commit: CommitNode | null` — если `commit?.kind === 'uncommitted'` (или `hash === 'UNCOMMITTED'`), показать Uncommited State view.
  - оставить `onCommit`, добавить `onCopyHash`, `onCreatePatch`, `onCherryPick`, `onRevert`, `onResetToHere` (или убрать последние, по scope).

  ```ts
  export type RepoDetailPanelProps = {
    commit: CommitNode | null;
    onCopyHash: (hash: string) => void;
    onCreatePatch: (hash: string) => void;
    onCherryPick: (hash: string) => void;
    onRevert: (hash: string) => void;
    onResetToHere: (hash: string) => void;
    onCommit: (message: string) => void;
    className?: string;
  };
  ```

Файл: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx`:
- Если `commit` нет — рендерим placeholder "Select a commit to see details".
- Если `commit` есть и `commit.kind === 'uncommitted'`:
  - Top: `<h2>Uncommited changes</h2>` + `<p>Select files to commit</p>`.
  - Center: `<FileChangesPanel>` (или свой список) — занимает всё свободное место, scroll.
  - Bottom: `<CommitMessageForm>` (textarea + кнопка Commit) — высота ≤ 250px.
- Если `commit` есть (нормальный коммит):
  - Top: информация о коммите (subject, author, date, hash).
  - Center: список изменённых файлов коммита (через `useCommitFiles`).
  - Bottom: footer с Patch/Cherry-pick/Revert/Reset.

### Шаг 4. Подключить в RepositoryPage

Файл: `src/pages/repository/ui/RepositoryPage.tsx`:
- Передавать `onCommit={handleCommit}` (которое вызывает `commitChanges` фичу).
- Импортировать `useCommitFiles` и пробросить в `RepoDetailPanel` (если паттерн prop drilling — альтернативно, загружать данные в `RepoDetailPanel` напрямую по `commit.hash`).
- `handleCommit(message)` — вызывает `useCommitChanges()`, toast.success/error.

### Шаг 5. Утилизировать `uncommittedCount`

`uncommittedCount` больше не используется (он был в footer). Убрать из props.

### Шаг 6. Тесты

Файл: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.test.tsx` (новый):
- Тест: рендер с `commit.kind === 'uncommitted'` — есть заголовок "Uncommited changes", форма commit message.
- Тест: рендер с обычным commit — есть список файлов.
- Тест: рендер с `commit === null` — placeholder.

### Шаг 7. Верификация

- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Dev: клик на коммит — справа список файлов. Uncommited state — список untracked/modified + форма.

## Acceptance criteria

- [ ] При выборе обычного коммита — список изменённых файлов показывается в правой панели.
- [ ] При выборе "Uncommited changes" — список uncommitted файлов + форма commit message.
- [ ] Кнопка Stash полностью убрана.
- [ ] Текстарея + кнопка commit не более 250px по высоте.
- [ ] Список файлов скроллится если не помещается.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] `npm test` — без новых fallов.

## Зависит от
TASK-325 (uncommitted-нода в графе) — для `commit.kind === 'uncommitted'`.

## Заметки

- `FileChangesPanel` уже есть в `@/widgets/file-changes-panel`. Использовать его.
- `CommitMessageForm` — `@/widgets/commit-message-form`.
- `useCommitChanges` — `@/features/commit-changes`.
- Стиль AGENTS.md.

## Статус: DONE — список изменённых файлов коммита + форма коммита в uncommited state

### Что сделано
- Добавлен IPC-канал `git:show` (preload + main + schema), обёрнутый в shared API `gitShow`.
- В `src/entities/file-change` появились `listCommitFiles`, `fetchCommitFiles`, хук `useCommitFiles` (queryKey `commit-files`).
- `CommitNode` расширен полем `kind?: 'commit' | 'uncommitted'`.
- `RepoDetailPanel` переработан:
  - `commit === null` — placeholder "Select a commit".
  - `commit.isUncommitted || hash === 'UNCOMMITTED'` — заголовок "Uncommited changes", `<FileChangesPanel>` (scroll), `<CommitMessageForm>` в footer ≤ 250px.
  - обычный коммит — header (subject/author/date/hash/parents/lane), scroll-список файлов через `useCommitFiles`, footer с Patch/Cherry-pick/Revert/Reset.
  - Кнопка Stash полностью убрана.
  - Старые пропсы `onStash`, `onDiscard`, `uncommittedCount` удалены; `onCommit(message: string)`.
- `RepositoryPage` использует `useCommit` из `@/features/commit-changes` и передаёт `onCommit` в `RepoDetailPanel`.
- Покрытие тестами: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.test.tsx` (4 теста) + тесты `parseShowNameStatus` и `gitShow`.

### Acceptance criteria (отметить выполненные)
- [x] При выборе обычного коммита — список изменённых файлов показывается в правой панели.
- [x] При выборе "Uncommited changes" — список uncommitted файлов + форма commit message.
- [x] Кнопка Stash полностью убрана.
- [x] Текстарея + кнопка commit не более 250px по высоте.
- [x] Список файлов скроллится если не помещается.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] `npm test` — без новых падений (267 passed).

### Заметки для ревьюера
- В `parseShowNameStatus` индекс и workTree ставятся в одинаковый код, чтобы пройти существующую проверку `isFileStatusCode`. Поле `isStaged: true, isUnstaged: false` устанавливается в `listCommitFiles`.
- В `UncommittedView` передаётся `message.header` (строкой) в `onCommit`. Полное тело/футер из `CommitMessageForm` пока игнорируется (это соответствует типу `onCommit: (message: string) => void` из задачи). При необходимости легко расширить до объекта.
- В `CommitView` кнопки Patch/Cherry-pick/Revert/Reset вызывают `toast.info("Coming soon")` — реализация оставлена вне scope задачи.

