export { RepoConfigDialog } from './ui';
export type {
  RepoConfigDialogProps,
  ConfigRowProps,
  ConfigFieldSpec
} from './ui';

export { useGitConfig, useSetRepoConfig, gitConfigQueryKey } from './model';
export type {
  ConfigScope,
  GitConfigQueryArgs,
  SetRepoConfigInput,
  UseSetRepoConfigResult
} from './model';
