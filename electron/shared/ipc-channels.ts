export const IPC_CHANNELS = {
  APP_INFO: 'app:info',

  GIT_COMMIT: 'git:commit',
  GIT_STASH: 'git:stash',
  GIT_MERGE: 'git:merge',
  GIT_REBASE: 'git:rebase'
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];