import { useCallback, useEffect, useState } from 'react';

import { scanRepos, useCreateWorkspace } from '@/entities/workspace';

export type WorkspaceCreateStage = 'idle' | 'picking' | 'previewing' | 'submitting';

export type WorkspaceCreatePreview = {
  repos: string[];
  isScanning: boolean;
};

export type WorkspaceCreateFlow = {
  path: string | null;
  stage: WorkspaceCreateStage;
  preview: WorkspaceCreatePreview;
  pickDirectory: () => Promise<void>;
  submit: (name: string) => Promise<boolean>;
  reset: () => void;
};

const EMPTY_PREVIEW: WorkspaceCreatePreview = {
  repos: [],
  isScanning: false
};

export const useCreateWorkspaceFlow = (): WorkspaceCreateFlow => {
  const [path, setPath] = useState<string | null>(null);
  const [repos, setRepos] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const mutation = useCreateWorkspace();

  useEffect(() => {
    if (!path) {
      setRepos([]);
      setIsScanning(false);
      return;
    }

    const controller = new AbortController();
    setIsScanning(true);

    void scanRepos(path, { signal: controller.signal })
      .then((found) => {
        if (controller.signal.aborted) return;
        setRepos(found);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setRepos([]);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsScanning(false);
      });

    return () => {
      controller.abort();
    };
  }, [path]);

  const pickDirectory = useCallback(async (): Promise<void> => {
    const api = typeof window === 'undefined' ? null : window.api;
    if (!api?.fsSelectDirectory) return;
    const selected = await api.fsSelectDirectory();
    if (selected) {
      setPath(selected);
    }
  }, []);

  const submit = useCallback(
    async (name: string): Promise<boolean> => {
      if (!path) return false;
      const trimmedName = name.trim();
      const result = await mutation.mutateAsync({
        path,
        ...(trimmedName.length > 0 ? { name: trimmedName } : {})
      });
      return result !== null;
    },
    [mutation, path]
  );

  const reset = useCallback((): void => {
    setPath(null);
    setRepos([]);
    setIsScanning(false);
    mutation.reset();
  }, [mutation]);

  const stage: WorkspaceCreateStage = !path
    ? 'idle'
    : isScanning
      ? 'previewing'
      : mutation.isPending
        ? 'submitting'
        : 'picking';

  return {
    path,
    stage,
    preview: path ? { repos, isScanning } : EMPTY_PREVIEW,
    pickDirectory,
    submit,
    reset
  };
};
