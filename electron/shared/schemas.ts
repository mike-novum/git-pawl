import { z } from 'zod';

const commitMessageSchema = z.union([
  z.string().min(1),
  z.object({
    header: z.string().min(1),
    body: z.string().optional(),
    footer: z.string().optional()
  })
]);

export const gitCommitSchema = z.object({
  repoPath: z.string(),
  message: commitMessageSchema,
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
  onto: z.string(),
  interactive: z.boolean().optional()
});

export type GitCommitArgs = z.infer<typeof gitCommitSchema>;
export type GitStashArgs = z.infer<typeof gitStashSchema>;
export type GitMergeArgs = z.infer<typeof gitMergeSchema>;
export type GitRebaseArgs = z.infer<typeof gitRebaseSchema>;