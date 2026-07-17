# TASK-092 — Page: repository (сборка)

## Acceptance criteria
- [x] Объединяет все виджеты:
  - RepoHeader (иконка, имя, branch, fetch/pull/push)
  - CommitGraph
  - FileChangesPanel + CommitMessageForm
  - TerminalOutput
  - Branches/Tags/Stash Tabs
- [x] Макет через ResizablePanel.
- [x] Storybook story.

## Зависит от
- TASK-080, TASK-083, TASK-091, TASK-061..067

## Что сделано
- `src/pages/repository/ui/RepositoryPage.tsx` — компоновка виджетов через ResizablePanel (вертикальный сплит на graph + (changes/commit + terminal); горизонтальный сплит graph/tags-tabs и changes/terminal).
- `src/pages/repository/ui/RepoHeader.tsx` — лёгкий header с иконкой, именем, веткой и кнопками fetch/pull/push.
- `src/pages/repository/ui/BranchTabsSection.tsx` — табы Branches/Tags/Stash с индикаторами количества.
- `src/pages/repository/ui/types.ts` — типы компонентов.
- `src/pages/repository/ui/RepositoryPage.stories.tsx` — Storybook story.
- `src/pages/repository/ui/index.ts` — реэкспорты.
- `src/pages/repository/types.ts` — реэкспорт `RepositoryPageProps`.
