import { useMemo, useState } from 'react';
import type { FC } from 'react';
import {
  AlertCircle,
  ChevronRight,
  GitFork,
  Globe,
  Lock,
  RefreshCw
} from 'lucide-react';

import { AccountAvatar, AccountBadge } from '@/entities/account';
import {
  Button,
  Dialog,
  Empty,
  ScrollArea,
  Spinner,
  useToast
} from '@/shared/ui';

import {
  buildCloneDestPath,
  useCloneFromRepo,
  type UseCloneFromRepoDeps
} from '../model';

import type { CloneFromAccountDialogProps } from './types';

const filterRepos = <T extends { name: string; fullName: string }>(
  repos: T[],
  query: string
): T[] => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return repos;
  return repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(trimmed) ||
      repo.fullName.toLowerCase().includes(trimmed)
  );
};

export const CloneFromAccountDialog: FC<CloneFromAccountDialogProps> = ({
  open,
  onOpenChange,
  activeWorkspace,
  deps
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="Clone from account"
          description="Pick a connected account, then clone one of its repositories into the active workspace."
        >
          <CloneFromAccountDialogBody
            activeWorkspace={activeWorkspace}
            onClose={() => onOpenChange(false)}
            deps={deps}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

type CloneFromAccountDialogBodyProps = {
  activeWorkspace: CloneFromAccountDialogProps['activeWorkspace'];
  onClose: () => void;
  deps?: Partial<UseCloneFromRepoDeps>;
};

const CloneFromAccountDialogBody: FC<CloneFromAccountDialogBodyProps> = ({
  activeWorkspace,
  onClose,
  deps
}) => {
  const toast = useToast();
  const {
    accounts,
    accountsQuery,
    selectedAccount,
    selectedProvider,
    selectedAccountId,
    selectAccount,
    repos,
    reposQuery,
    clone,
    cloningRepoId,
    setCloningRepoId
  } = useCloneFromRepo(deps);

  const [search, setSearch] = useState('');

  const workspacePath = activeWorkspace?.path ?? '';

  const filteredRepos = useMemo(
    () => filterRepos(repos, search),
    [repos, search]
  );

  const handleClone = (repoId: string): void => {
    const repo = repos.find((entry) => entry.id === repoId);
    if (!repo) return;
    if (!workspacePath) {
      toast.error({
        title: 'No active workspace',
        description: 'Select or create a workspace before cloning.'
      });
      return;
    }
    setCloningRepoId(repoId);
    const destPath = buildCloneDestPath(workspacePath, repo.name);
    clone.mutate(
      { url: repo.url, destPath },
      {
        onSuccess: () => {
          toast.success({
            title: 'Repository cloned',
            description: repo.fullName
          });
          setCloningRepoId(null);
          onClose();
        },
        onError: (error) => {
          toast.error({
            title: 'Clone failed',
            description: error.message
          });
          setCloningRepoId(null);
        }
      }
    );
  };

  const handleRefresh = (): void => {
    if (selectedProvider && selectedAccount) {
      void reposQuery.refetch();
    }
  };

  const accountsLoading = accountsQuery.isLoading;
  const reposLoading = reposQuery.isLoading;
  const cloneError = clone.error;
  const cloneProgress = clone.progress;

  const accountsEmpty = !accountsLoading && accounts.length === 0;

  if (accountsLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
        <Spinner size="sm" label="Loading accounts" />
        Loading accounts...
      </div>
    );
  }

  if (accountsEmpty) {
    return (
      <Empty
        icon={<GitFork className="size-6" />}
        title="No accounts connected"
        description="Connect a GitHub or GitLab account first to browse its repositories."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-foreground text-xs font-medium">Account</span>
        <div className="flex flex-wrap gap-2">
          {accounts.map((account) => (
            <AccountBadge
              key={account.id}
              account={account}
              active={account.id === selectedAccountId}
              onSelect={(id) => selectAccount(id)}
            />
          ))}
        </div>
      </div>

      {!selectedAccount ? (
        <Empty
          icon={<ChevronRight className="size-6" />}
          title="Pick an account"
          description="Choose a connected account above to see its repositories."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AccountAvatar
                login={selectedAccount.login}
                avatarUrl={selectedAccount.avatarUrl}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-medium">
                  {selectedAccount.login}
                </span>
                <span className="text-muted-foreground text-xs">
                  {selectedProvider === 'github' ? 'GitHub' : 'GitLab'}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={reposQuery.isFetching}
              leftIcon={
                <RefreshCw
                  className={
                    reposQuery.isFetching ? 'size-4 animate-spin' : 'size-4'
                  }
                />
              }
            >
              Refresh
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="clone-from-account-search"
              className="text-foreground text-xs font-medium"
            >
              Filter repositories
            </label>
            <input
              id="clone-from-account-search"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="Filter by name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
            />
          </div>

          {!activeWorkspace && (
            <p className="text-muted-foreground text-xs">
              Pick or create a workspace first — clones go to{' '}
              <span className="font-mono">
                {workspacePath || '<workspace>'}/&lt;repo&gt;
              </span>
              .
            </p>
          )}

          {reposLoading ? (
            <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
              <Spinner size="sm" label="Loading repositories" />
              Loading repositories...
            </div>
          ) : filteredRepos.length === 0 ? (
            <Empty
              icon={<GitFork className="size-6" />}
              title={
                repos.length === 0 ? 'No repositories found' : 'No matches'
              }
              description={
                repos.length === 0
                  ? 'This account does not have any accessible repositories.'
                  : 'Try a different filter term.'
              }
            />
          ) : (
            <ScrollArea className="border-border bg-muted/20 max-h-72 rounded-md border">
              <ul className="divide-border divide-y text-sm">
                {filteredRepos.map((repo) => {
                  const isCloning = cloningRepoId === repo.id;
                  const disabled = clone.isPending && !isCloning;
                  return (
                    <li
                      key={repo.id}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      {repo.isPrivate ? (
                        <Lock
                          aria-hidden="true"
                          className="text-muted-foreground size-4 shrink-0"
                        />
                      ) : (
                        <Globe
                          aria-hidden="true"
                          className="text-muted-foreground size-4 shrink-0"
                        />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">
                          {repo.fullName}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          default: {repo.defaultBranch}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={disabled || !workspacePath}
                        loading={isCloning}
                        onClick={() => handleClone(repo.id)}
                      >
                        Clone
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}

          {cloneProgress && clone.isPending && (
            <div className="border-border bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
              <Spinner size="sm" label={cloneProgress} />
              <span className="truncate">{cloneProgress}</span>
            </div>
          )}

          {cloneError && !clone.isPending && (
            <div
              role="alert"
              className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
            >
              <AlertCircle
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>{cloneError.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

CloneFromAccountDialogBody.displayName = 'CloneFromAccountDialogBody';

CloneFromAccountDialog.displayName = 'CloneFromAccountDialog';
