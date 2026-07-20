# TASK-212 — WorkspaceHero: компактный info-блок

## Баг
В `src/pages/workspace/ui/WorkspaceHero.tsx` блок с информацией по репозиторию (путь, количество репозиториев, modified count, размер, иконка) занимает слишком много вертикального места и выглядит громоздко. Нужно сделать его компактнее — перенести path/repoCount/modified/size в более плотный layout (горизонтальная группа meta-чипов или одна строка с разделителями).

## Что сделать
1. Открыть `src/pages/workspace/ui/WorkspaceHero.tsx`.
2. Переработать layout:
   - Уменьшить иконку воркспейса (например, `size-10` вместо `size-14`).
   - Объединить meta-инфо в один компактный ряд под заголовком: `{repoCount} repos · {modifiedCount} modified · {formatBytes(sizeBytes)} · {path}` с `text-xs text-muted-foreground`, mono-шрифтом для path.
   - Либо вынести path в тултип/трейл.
3. Сохранить доступность: `title={workspace.path}` на path.

## Acceptance criteria
- [ ] Hero выглядит заметно компактнее (высота уменьшена).
- [ ] Вся информация (путь, счётчики, размер) по-прежнему видна и доступна.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус
⏳ pending