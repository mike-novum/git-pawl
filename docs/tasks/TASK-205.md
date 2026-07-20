# TASK-205 — useAddExistingRepo: не инвалидировать кэш при отмене выбора директории

## Баг
В `src/features/add-existing-repo/model/useAddExistingRepo.ts` колбэк `onSuccess` инвалидирует `['repository-list']` безусловно. Когда пользователь нажимает "Add repo" / "Add to Root" и **отменяет** системный диалог выбора папки, мутация всё равно завершается с `null`, но `onSuccess` всё равно вызывается и обновляет список репозиториев. Это лишний сетевой/дисковый round-trip и мигание UI.

## Что сделать
1. Открыть `src/features/add-existing-repo/model/useAddExistingRepo.ts`.
2. В `onSuccess` проверять, что `_data` (результат) не равен `null` — только тогда инвалидировать кэш.
3. Если `_data === null` — выйти без side-effects.

## Acceptance criteria
- [ ] При отмене выбора папки список репозиториев НЕ обновляется.
- [ ] При успешном выборе папки — обновляется как раньше.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус
⏳ pending