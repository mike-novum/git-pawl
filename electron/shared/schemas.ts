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

export const currentBranchSchema = z.object({
  repoPath: z.string()
});

export const gitTagSchema = z.object({
  repoPath: z.string(),
  action: z.union([z.literal('list'), z.literal('create'), z.literal('delete')]),
  name: z.string().optional(),
  target: z.string().optional()
});

export const gitPatchSchema = z.object({
  repoPath: z.string(),
  range: z.string()
});

export const gitConfigSchema = z.object({
  repoPath: z.string(),
  key: z.string(),
  value: z.string().optional()
});

export const gitHooksSchema = z.object({
  repoPath: z.string(),
  list: z.literal(true)
});

export const fsSizeSchema = z.object({
  path: z.string()
});

export const fsIconSchema = z.object({
  path: z.string()
});

export const fsWorkspaceListSchema = z.object({});

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
export type CurrentBranchArgs = z.infer<typeof currentBranchSchema>;
export type GitTagArgs = z.infer<typeof gitTagSchema>;
export type GitPatchArgs = z.infer<typeof gitPatchSchema>;
export type GitConfigArgs = z.infer<typeof gitConfigSchema>;
export type GitHooksArgs = z.infer<typeof gitHooksSchema>;
export type FsSizeArgs = z.infer<typeof fsSizeSchema>;
export type FsIconArgs = z.infer<typeof fsIconSchema>;
export type FsWorkspaceListArgs = z.infer<typeof fsWorkspaceListSchema>;
export type AuthGithubCompleteArgs = z.infer<typeof authGithubCompleteSchema>;
export type AuthGitlabCompleteArgs = z.infer<typeof authGitlabCompleteSchema>;
export type AccountSetActiveArgs = z.infer<typeof accountSetActiveSchema>;
export type AccountRemoveArgs = z.infer<typeof accountRemoveSchema>;
export type GithubListReposArgs = z.infer<typeof githubListReposSchema>;
export type GitlabListReposArgs = z.infer<typeof gitlabListReposSchema>;