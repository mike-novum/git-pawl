

- при запуске команды npm run dev я словил ошибку 

вот это в терминале в логах увидел:

dev server running for the electron renderer process at:

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

start electron app...

App threw an error during load
Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/mikenovum/projects/git-pawl/node_modules/electron-store/index.js from /Users/mikenovum/projects/git-pawl/out/main/index.js not supported.
Instead change the require of /Users/mikenovum/projects/git-pawl/node_modules/electron-store/index.js in /Users/mikenovum/projects/git-pawl/out/main/index.js to a dynamic import() which is available in all CommonJS modules.
    at c._load (node:electron/js2c/node_init:2:16955)
    at Object.<anonymous> (/Users/mikenovum/projects/git-pawl/out/main/index.js:8:15)


а вот это в нативном окне электрона (просто маленькое окно с уведомлением об ошибке открылось):

A JavaScript error occurred in the main process

Uncaught Exception:
Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/mikenovum/projects/git-pawl/node_modules/electron-store/index.js from /Users/mikenovum/projects/git-pawl/out/main/index.js not supported.
Instead change the require of /Users/mikenovum/projects/git-pawl/node_modules/electron-store/index.js in /Users/mikenovum/projects/git-pawl/out/main/index.js to a dynamic import() which is available in all CommonJS modules.
at c._load (node:electron/js2c/node_init:2:16955)
at Object.<anonymous> (/Users/mikenovum/projects/git-pawl/out/main/index.js:8:15)