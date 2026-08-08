# Баги 

- на странице воркспейсов в карточке воркспейса текст размера репозитория прижимается к иконке папки - не хватает отступа

- когда захожу в общие настройки у меня на экране настроек отображается кнопка перехода в настройки - ее не должно быть, я же уже в настройках

- захожу в воркспейс, там карточки репозиториев, в карточке репозитория почему то размер этого репозитория отображается на разном расстоянии от левого края, выглядит не красиво, надо прибить к краю карточки


- когда жму Add  to Root на странице воркспейса, и отменяю выбор файла (закрываю системное окно выбора файла) у меня почему то список с репозитория обновляется, а он должен обновляться только если я выбрал директорию какую то и подтвердил

- когда открываю настройки воркспейса (выезжающая панель справа) и жму на кнопку для добавления иконки - ничего не происходит

- когда перехожу на страницу репозитория, шапка страницы как будто такая же как и на странице воркспейса, а так не должно быть. в шапке почему то по прежнему селект для переключения воркспейсов. в шапке должно быть название репы без всяких селектов

- на странице репозитория почему то не отображаются данные по репозиторию, ни веток ни графа с коммитами 


- в консоли были странные логи об ошибках:
Error occurred in handler for 'fs:size': [Error: ENOENT: no such file or directory, stat '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'
}
Error occurred in handler for 'fs:size': [Error: ENOENT: no such file or directory, stat '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'
}
Error occurred in handler for 'git:status': Error: Repository path does not exist: /Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da
    at ensureRepoPath (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1104:11)
    at gitStatus (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1133:15)
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1898:66
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:259:12
    at WebContents.<anonymous> (node:electron/js2c/browser_init:2:87039)
    at WebContents.emit (node:events:518:28)
Error occurred in handler for 'git:status': Error: Repository path does not exist: /Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da
    at ensureRepoPath (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1104:11)
    at gitStatus (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1133:15)
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1898:66
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:259:12
    at WebContents.<anonymous> (node:electron/js2c/browser_init:2:87039)
    at WebContents.emit (node:events:518:28)
Error occurred in handler for 'git:branch': Error: git branch failed (exit ENOENT): 
    at runGit$5 (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:549:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async gitBranch (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:581:24)
    at async WebContents.<anonymous> (node:electron/js2c/browser_init:2:87023)
Error occurred in handler for 'git:status': Error: Repository path does not exist: /Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da
    at ensureRepoPath (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1104:11)
    at gitStatus (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1133:15)
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1898:66
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:259:12
    at WebContents.<anonymous> (node:electron/js2c/browser_init:2:87039)
    at WebContents.emit (node:events:518:28)
Error occurred in handler for 'git:tag': Error: git tag failed (exit 1): git tag failed with exit 1
    at buildError$3 (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1349:10)
    at gitTag (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1371:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async WebContents.<anonymous> (node:electron/js2c/browser_init:2:87023)
Error occurred in handler for 'fs:size': [Error: ENOENT: no such file or directory, stat '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'
}
Error occurred in handler for 'fs:size': [Error: ENOENT: no such file or directory, stat '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'
}
Error occurred in handler for 'git:log': Error: Repository path does not exist: /Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da
    at ensureRepoPath (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1104:11)
    at gitLog (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1142:15)
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1899:60
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:259:12
    at WebContents.<anonymous> (node:electron/js2c/browser_init:2:87039)
    at WebContents.emit (node:events:518:28)
Error occurred in handler for 'git:log': Error: Repository path does not exist: /Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da
    at ensureRepoPath (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1104:11)
    at gitLog (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1142:15)
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1899:60
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:259:12
    at WebContents.<anonymous> (node:electron/js2c/browser_init:2:87039)
    at WebContents.emit (node:events:518:28)
Error occurred in handler for 'git:log': Error: Repository path does not exist: /Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da
    at ensureRepoPath (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1104:11)
    at gitLog (file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1142:15)
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:1899:60
    at file:///Users/mikenovum/projects/git-pawl/out/main/index.mjs:259:12
    at WebContents.<anonymous> (node:electron/js2c/browser_init:2:87039)
    at WebContents.emit (node:events:518:28)
Error occurred in handler for 'fs:size': [Error: ENOENT: no such file or directory, stat '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'stat',
  path: '/Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da'
}

- удаление воркспейса из боковой панели странно отрабатывает , ничего не удаляет, нужно чтобы пропадала папка из списка воркспейсов (но на диске ничего не удалять!)

# Доработки по интерфейсу 

- бэкдроп у боковой панели настроек воркспейса очень светлый надо темнее сделать в темной теме, сейчас не красиво смотрится 

- на странице воркспейса у тулбара с поиском убрать фон и подчеркивание

- на странице воркспейса есть блок с информацией по репозиторию (путь, количество репозиториев, количество модифицированных репозиториев, иконка). это надо как то в шапке разместить, сейчас выглядит некомпактно ниразу

