import { gitBranch, gitStatus } from '@/shared/api';

import type { Branch, BranchUpstream, CurrentBranchInfo } from '../model/types';

export type { Branch, BranchUpstream, CurrentBranchInfo };

const UPSTREAM_PATTERN = /^\[([^\]]+)\]?$/;

const parseUpstreamSegment = (segment: string | undefined): BranchUpstream | undefined => {
  if (!segment) return undefined;
  const match = segment.match(UPSTREAM_PATTERN);
  if (!match) return undefined;
  const ref = match[1];
  if (!ref) return undefined;
  return { ref, ahead: 0, behind: 0 };
};

const splitMarker = (raw: string): {
  name: string;
  current: boolean;
  upstream?: BranchUpstream;
} => {
  let name = raw;
  let current = false;
  let upstream: BranchUpstream | undefined;

  if (name.startsWith('*')) {
    current = true;
    name = name.slice(1).trim();
  } else if (name.startsWith(' ')) {
    name = name.trim();
  }

  const openIdx = name.indexOf(': ');
  if (openIdx !== -1) {
    const baseName = name.slice(0, openIdx);
    const remaining = name.slice(openIdx + 2);
    const upstreamSegment = remaining.split(' ')[0];
    const parsed = parseUpstreamSegment(upstreamSegment);
    if (parsed) {
      upstream = parsed;
      name = baseName;
    }
  }

  return { name, current, upstream };
};

const deriveCurrent = (status: {
  branch: { current?: string; detached: boolean };
}): CurrentBranchInfo => {
  if (status.branch.detached) {
    return { name: null, detached: true };
  }
  const name = status.branch.current ?? null;
  return { name, detached: false };
};

export const listBranches = (repoPath: string): Promise<string[]> =>
  gitBranch({ repoPath, action: 'list' }) as Promise<string[]>;

export const buildBranches = (
  rawNames: string[] | null | undefined,
  currentBranchName: string | null,
  detached: boolean
): Branch[] => {
  if (!Array.isArray(rawNames) || rawNames.length === 0) return [];

  const result = rawNames.map((raw) => {
    const parsed = splitMarker(raw);
    const isCurrent = !detached && parsed.name === currentBranchName;
    return {
      name: parsed.name,
      current: parsed.current || isCurrent,
      upstream: parsed.upstream
    } satisfies Branch;
  });

  if (currentBranchName && !result.some((branch) => branch.current)) {
    result.unshift({
      name: currentBranchName,
      current: true,
      upstream: undefined
    });
  }

  return result;
};

export const fetchBranches = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<Branch[]> => {
  if (signal?.aborted) return [];
  const [namesResult, statusResult] = await Promise.allSettled([
    listBranches(repoPath),
    gitStatus({ repoPath }) as Promise<{
      branch: { current?: string; detached: boolean };
    }>
  ]);

  if (signal?.aborted) return [];

  const names = namesResult.status === 'fulfilled' ? namesResult.value : [];
  const status =
    statusResult.status === 'fulfilled' ? statusResult.value : null;

  const current = status ? deriveCurrent(status) : { name: null, detached: false };
  return buildBranches(names, current.name, current.detached);
};

export const fetchCurrentBranch = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<CurrentBranchInfo> => {
  if (signal?.aborted) return { name: null, detached: false };
  try {
    const status = (await gitStatus({ repoPath })) as {
      branch: { current?: string; detached: boolean };
    };
    if (signal?.aborted) return { name: null, detached: false };
    return deriveCurrent(status);
  } catch {
    return { name: null, detached: false };
  }
};
