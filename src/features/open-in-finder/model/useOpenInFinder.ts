import { shellOpenFinder } from '@/shared/api';

export type OpenInFinderInput = {
  path: string;
};

export type OpenInFinderResult = void;

export const openInFinder = async (input: OpenInFinderInput): Promise<OpenInFinderResult> => {
  if (!input.path) {
    throw new Error('path is required');
  }
  await shellOpenFinder({ path: input.path });
};
