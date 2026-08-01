import { z } from 'zod';

export const noArgsSchema = z.undefined();

export const storeGetSchema = z.object({
  key: z.string()
});

export const storeSetSchema = z
  .object({
    key: z.string(),
    value: z.unknown()
  })
  .refine((data) => 'value' in data, {
    message: 'value is required',
    path: ['value']
  });

export const storeDeleteSchema = z.object({
  key: z.string()
});

export const gitStatusSchema = z.object({
  repoPath: z.string()
});

export const gitLogSchema = z.object({
  repoPath: z.string(),
  maxCount: z.number().int().positive().optional()
});

export const gitDiffSchema = z.object({
  repoPath: z.string(),
  range: z.string().optional()
});

export const gitRevParseSchema = z.object({
  repoPath: z.string()
});

export const gitCloneSchema = z.object({
  url: z.string().min(1),
  destPath: z.string()
});

export const gitFetchSchema = z.object({
  repoPath: z.string(),
  remote: z.string().optional()
});

export const gitPullSchema = z.object({
  repoPath: z.string(),
  remote: z.string().optional(),
  branch: z.string().optional()
});

export const gitPushSchema = z.object({
  repoPath: z.string(),
  remote: z.string().optional(),
  branch: z.string().optional()
});

export const gitCommitSchema = z.object({
  repoPath: z.string(),
  message: z.union([z.string(), z.object({ header: z.string(), body: z.string().optional(), footer: z.string().optional() })]),
  files: z.array(z.string()).optional(),
  author: z.string().optional(),
  noVerify: z.boolean().optional()
});

export const gitStashSchema = z.object({
  repoPath: z.string(),
  action: z.union([
    z.literal('push'),
    z.literal('pop'),
    z.literal('apply'),
    z.literal('drop')
  ]),
  message: z.string().optional(),
  ref: z.string().optional()
});

export const gitMergeSchema = z.object({
  repoPath: z.string(),
  branch: z.string(),
  noFF: z.boolean().optional(),
  message: z.string().optional()
});

export const gitRebaseSchema = z.object({
  repoPath: z.string(),
  branch: z.string(),
  onto: z.string().optional()
});

export const gitResetSchema = z.object({
  repoPath: z.string(),
  mode: z.union([z.literal('soft'), z.literal('mixed'), z.literal('hard')]),
  ref: z.string().optional()
});

export const gitRevertSchema = z.object({
  repoPath: z.string(),
  commit: z.string(),
  noEdit: z.boolean().optional()
});

export const gitAmendSchema = z.object({
  repoPath: z.string(),
  message: z.string().optional(),
  noVerify: z.boolean().optional()
});

export const gitCheckoutSchema = z.object({
  repoPath: z.string(),
  ref: z.string(),
  create: z.boolean().optional()
});

export const gitBranchSchema = z.object({
  repoPath: z.string(),
  action: z.union([z.literal('list'), z.literal('create'), z.literal('delete')]),
  name: z.string().optional(),
  force: z.boolean().optional()
});

export const gitBranchFirstParentSchema = z.object({
  repoPath: z.string()
});

export const currentBranchSchema = z.object({
  repoPath: z.string()
});

export const gitTagSchema = z.object({
  repoPath: z.string(),
  action: z.union([z.literal('list'), z.literal('create'), z.literal('delete')]),
  name: z.string().optional(),
  target: z.string().optional(),
  message: z.string().optional(),
  annotated: z.boolean().optional(),
  force: z.boolean().optional()
});

export const gitPatchSchema = z.object({
  repoPath: z.string(),
  range: z.string().optional(),
  destDir: z.string().optional(),
  apply: z.boolean().optional(),
  threeWay: z.boolean().optional(),
  file: z.string().optional()
});

export const gitConfigSchema = z.object({
  repoPath: z.string(),
  scope: z.union([z.literal('local'), z.literal('global'), z.literal('system')]).optional(),
  key: z.string().min(1).optional(),
  value: z.string().optional(),
  list: z.boolean().optional()
});

export const gitHooksSchema = z.object({
  repoPath: z.string(),
  list: z.boolean().optional()
});

export const fsSelectDirectorySchema = z.undefined();

export const fsSelectFileSchema = z.undefined();

export const fsSizeSchema = z.object({
  repoPath: z.string()
});

export const fsWorkspaceSizeSchema = z.object({
  workspacePath: z.string().min(1)
});

export const fsIconSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('set'),
    repoPath: z.string(),
    sourceImagePath: z.string()
  }),
  z.object({
    action: z.literal('set-workspace'),
    workspaceId: z.string(),
    sourceImagePath: z.string()
  }),
  z.object({
    action: z.literal('remove'),
    repoPath: z.string()
  })
]);

export const fsWorkspaceListSchema = z.undefined();

export const fsWorkspaceCreateSchema = z.object({
  path: z.string(),
  name: z.string().optional()
});

export const fsWorkspaceRemoveSchema = z.object({
  id: z.string().min(1)
});

export const fsDetectReposSchema = z.object({
  path: z.string(),
  maxDepth: z.number().int().positive().optional()
});

export const fsBuildRepoIdSchema = z.object({
  path: z.string()
});

export const fsScanReposSchema = z.object({
  path: z.string(),
  maxDepth: z.number().int().positive().optional()
});

export const fsReadImageDataUrlSchema = z.object({
  path: z.string().min(1)
});

export const authGithubCompleteSchema = z.object({
  code: z.string()
});

export const authGitlabCompleteSchema = z.object({
  code: z.string()
});

export const accountSetActiveSchema = z.object({
  id: z.string()
});

export const accountRemoveSchema = z.object({
  id: z.string()
});

export const githubListReposSchema = z.object({
  accountId: z.string()
});

export const gitlabListReposSchema = z.object({
  accountId: z.string()
});

export type NoArgs = z.infer<typeof noArgsSchema>;
export type StoreGetArgs = z.infer<typeof storeGetSchema>;
export type StoreSetArgs = z.infer<typeof storeSetSchema>;
export type StoreDeleteArgs = z.infer<typeof storeDeleteSchema>;
export type GitStatusArgs = z.infer<typeof gitStatusSchema>;
export type GitLogArgs = z.infer<typeof gitLogSchema>;
export type GitDiffArgs = z.infer<typeof gitDiffSchema>;
export type GitRevParseArgs = z.infer<typeof gitRevParseSchema>;
export type GitCloneArgs = z.infer<typeof gitCloneSchema>;
export type GitFetchArgs = z.infer<typeof gitFetchSchema>;
export type GitPullArgs = z.infer<typeof gitPullSchema>;
export type GitPushArgs = z.infer<typeof gitPushSchema>;
export type GitCommitArgs = z.infer<typeof gitCommitSchema>;
export type GitStashArgs = z.infer<typeof gitStashSchema>;
export type GitMergeArgs = z.infer<typeof gitMergeSchema>;
export type GitRebaseArgs = z.infer<typeof gitRebaseSchema>;
export type GitResetArgs = z.infer<typeof gitResetSchema>;
export type GitRevertArgs = z.infer<typeof gitRevertSchema>;
export type GitAmendArgs = z.infer<typeof gitAmendSchema>;
export type GitCheckoutArgs = z.infer<typeof gitCheckoutSchema>;
export type GitBranchArgs = z.infer<typeof gitBranchSchema>;
export type GitBranchFirstParentArgs = z.infer<typeof gitBranchFirstParentSchema>;
export type CurrentBranchArgs = z.infer<typeof currentBranchSchema>;
export type FsSizeArgs = z.infer<typeof fsSizeSchema>;
export type FsWorkspaceSizeArgs = z.infer<typeof fsWorkspaceSizeSchema>;
export type FsIconArgs = z.infer<typeof fsIconSchema>;
export type FsIconSetArgs = Extract<FsIconArgs, { action: 'set' }>;
export type FsIconSetWorkspaceArgs = Extract<FsIconArgs, { action: 'set-workspace' }>;
export type FsIconRemoveArgs = Extract<FsIconArgs, { action: 'remove' }>;
export type FsSelectDirectoryArgs = z.infer<typeof fsSelectDirectorySchema>;
export type FsSelectFileArgs = z.infer<typeof fsSelectFileSchema>;
export type FsWorkspaceListArgs = z.infer<typeof fsWorkspaceListSchema>;
export type FsWorkspaceCreateArgs = z.infer<typeof fsWorkspaceCreateSchema>;
export type FsWorkspaceRemoveArgs = z.infer<typeof fsWorkspaceRemoveSchema>;
export type FsDetectReposArgs = z.infer<typeof fsDetectReposSchema>;
export type FsBuildRepoIdArgs = z.infer<typeof fsBuildRepoIdSchema>;
export type FsScanReposArgs = z.infer<typeof fsScanReposSchema>;
export type FsReadImageDataUrlArgs = z.infer<typeof fsReadImageDataUrlSchema>;
export type GitTagArgs = z.infer<typeof gitTagSchema>;
export type GitPatchArgs = z.infer<typeof gitPatchSchema>;
export type GitConfigArgs = z.infer<typeof gitConfigSchema>;
export type GitHooksArgs = z.infer<typeof gitHooksSchema>;
export type AuthGithubCompleteArgs = z.infer<typeof authGithubCompleteSchema>;
export type AuthGitlabCompleteArgs = z.infer<typeof authGitlabCompleteSchema>;
export type AccountSetActiveArgs = z.infer<typeof accountSetActiveSchema>;
export type AccountRemoveArgs = z.infer<typeof accountRemoveSchema>;
export type GithubListReposArgs = z.infer<typeof githubListReposSchema>;
export type GitlabListReposArgs = z.infer<typeof gitlabListReposSchema>;