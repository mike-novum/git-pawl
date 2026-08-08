import type { Meta, StoryObj } from '@storybook/react';

import { computeLayout } from '../lib/computeLayout';
import { RepoGraph } from './RepoGraph';
import type { CommitNode } from '../types';

const makeCommit = (
  hash: string,
  parents: string[],
  subject: string,
  minutesAgo: number,
  isCurrent = false,
  branches: string[] | undefined = undefined
): CommitNode => ({
  hash,
  shortHash: hash.slice(0, 7),
  subject,
  author: 'mikenovum',
  timestamp: Date.now() - minutesAgo * 60_000,
  parents,
  lane: 0,
  branches,
  isCurrentBranch: isCurrent
});

const sampleCommits: CommitNode[] = [
  makeCommit(
    'c39473d9b5f8a1e0d4c2b6a8f3e7d1c5b9a4e2f0',
    ['7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e'],
    'docs(tasks): отметить TASK-300..304 как выполненные',
    30,
    true
  ),
  makeCommit(
    '7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e',
    [
      '0c84b19a2d4e6f8b0c1d3e5f7a9b1c3d5e7f9a1b',
      'b0606c323a3f9facb389452d73d2458270df956e'
    ],
    'merge: TASK-304 (reviewed APPROVED with non-blocking follow-ups)',
    120,
    false,
    ['main']
  ),
  makeCommit(
    'b0606c323a3f9facb389452d73d2458270df956e',
    ['ef90cf57265eb402b134b0261aa8bef378370792'],
    'feat(commit-graph): переделан граф коммитов — нормальное дерево с ветками и тегами',
    180,
    false,
    ['feat/commit-graph']
  ),
  makeCommit(
    '0c84b19a2d4e6f8b0c1d3e5f7a9b1c3d5e7f9a1b',
    [
      'ad59b5c2639e52704cd0b52230c5d4790c8af56c',
      '3b813b3479e179c9a7e916ff2b1f9e479074de8e'
    ],
    'merge: TASK-303 (reviewed APPROVED)',
    300,
    false
  ),
  makeCommit(
    '3b813b3479e179c9a7e916ff2b1f9e479074de8e',
    ['ef90cf57265eb402b134b0261aa8bef378370792'],
    'fix(drawer): убран белый бордер у боковой панели настроек',
    420,
    false,
    ['fix/drawer-border']
  ),
  makeCommit(
    'ad59b5c2639e52704cd0b52230c5d4790c8af56c',
    [
      '1f51c74a56d11feaf136f418e11ecbbe0d6f0b61',
      '541e1cdd9308d6bf05c9eb07b928fc47cabc82a0'
    ],
    'merge: TASK-302 (reviewed APPROVED)',
    540,
    false
  ),
  makeCommit(
    '541e1cdd9308d6bf05c9eb07b928fc47cabc82a0',
    ['ef90cf57265eb402b134b0261aa8bef378370792'],
    'feat(workspace-meta): перенесены path и счётчики воркспейса в шапку',
    660,
    false,
    ['feat/workspace-meta']
  ),
  makeCommit(
    '1f51c74a56d11feaf136f418e11ecbbe0d6f0b61',
    [
      '1af9b5b2f33ec6e87d85ef4fffa194c984537ed5',
      '6546605de0d1e7685ff45079663b6446faf5573e'
    ],
    'merge: TASK-301 (reviewed APPROVED)',
    780,
    false
  ),
  makeCommit(
    '6546605de0d1e7685ff45079663b6446faf5573e',
    ['ef90cf57265eb402b134b0261aa8bef378370792'],
    'feat(workspace-counters): persist-store + shimmer-skeleton для счётчиков',
    900,
    false,
    ['feat/workspace-counters']
  ),
  makeCommit(
    '1af9b5b2f33ec6e87d85ef4fffa194c984537ed5',
    [
      'ef90cf57265eb402b134b0261aa8bef378370792',
      'e2de032e3c1c7c6002f262c964bbc2f07a38c723'
    ],
    'merge: TASK-300 (reviewed APPROVED)',
    1080,
    false
  ),
  makeCommit(
    'e2de032e3c1c7c6002f262c964bbc2f07a38c723',
    ['ef90cf57265eb402b134b0261aa8bef378370792'],
    'fix(workspace-tile): убран артефакт "—" рядом со счётчиком репозиториев',
    1200,
    false,
    ['fix/workspace-tile-counter']
  ),
  makeCommit(
    'ef90cf57265eb402b134b0261aa8bef378370792',
    ['749aa941aed8a9d0d02a90195554ac408a395f5b'],
    'fix(workspace-delete): восстановлен вызов useRemoveWorkspace в handleDelete',
    1500,
    false
  ),
  makeCommit(
    '749aa941aed8a9d0d02a90195554ac408a395f5b',
    ['cad9dd0775b397079a0bb08d3f3abc298def8ee0'],
    'fix(merge): разрешены конфликты TASK-203/207/208/209',
    1800,
    false
  ),
  makeCommit(
    'cad9dd0775b397079a0bb08d3f3abc298def8ee0',
    [
      '5608417ebbbd994d1427765adb7fbf907aead280',
      '4df1a178275218a5d6fb12c315c5ba64353b88de'
    ],
    'merge: TASK-202..212 из worktree в main',
    2100,
    false
  ),
  makeCommit(
    '4df1a178275218a5d6fb12c315c5ba64353b88de',
    [
      '8d3f88b5d1aa2d7101ed6064651d0e8ec360fcf9',
      '9e47be766d6ff91e0154252a6fbad7b41bbf658a'
    ],
    'merge: TASK-206 + TASK-208 (icon picker + repo.path fix)',
    2400,
    false
  ),
  makeCommit(
    '9e47be766d6ff91e0154252a6fbad7b41bbf658a',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'feat(workspace-settings): выбор иконки воркспейса',
    2700,
    false,
    ['feat/workspace-icon']
  ),
  makeCommit(
    '8d3f88b5d1aa2d7101ed6064651d0e8ec360fcf9',
    [
      '496e276ca1dfe2aec2c5dc374a4651cc2f6c7db1',
      '98a6d06a94853b1956e391ae7ec70559b54aa676'
    ],
    'merge: TASK-209 Workspace delete IPC',
    3000,
    false
  ),
  makeCommit(
    '98a6d06a94853b1956e391ae7ec70559b54aa676',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'feat(workspace): добавлено удаление воркспейса через IPC',
    3300,
    false,
    ['feat/workspace-delete']
  ),
  makeCommit(
    '496e276ca1dfe2aec2c5dc374a4651cc2f6c7db1',
    [
      'e3f9703f282011493e8e165eb447bba2c6c69eaa',
      '8f8efb0f960d6654b0b4afb9939da9e33eb0c3c0'
    ],
    'merge: TASK-212 WorkspaceHero compact',
    3600,
    false
  ),
  makeCommit(
    '8f8efb0f960d6654b0b4afb9939da9e33eb0c3c0',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'fix(workspace-hero): компактный инфо-блок в шапке',
    3900,
    false,
    ['fix/workspace-hero']
  ),
  makeCommit(
    'e3f9703f282011493e8e165eb447bba2c6c69eaa',
    [
      'b81ab2c7d7de39eda21864f7fb043a5c526721bd',
      'a135d086f63030942d04799a69c6d02a80f7a2a7'
    ],
    'merge: TASK-210 Drawer backdrop',
    4200,
    false
  ),
  makeCommit(
    'a135d086f63030942d04799a69c6d02a80f7a2a7',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'feat(drawer): затемнен backdrop в темной теме',
    4500,
    false,
    ['feat/drawer-backdrop']
  ),
  makeCommit(
    'b81ab2c7d7de39eda21864f7fb043a5c526721bd',
    [
      'b0307ff22c65df5d61a73457daa964c1f1cfd64d',
      '668dd8e93f3f4b95e987e32eafbc36e58a2823e0'
    ],
    'merge: TASK-203 Hide settings button',
    4800,
    false
  ),
  makeCommit(
    '668dd8e93f3f4b95e987e32eafbc36e58a2823e0',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'fix(app-header): скрыта кнопка настроек на странице настроек',
    5100,
    false,
    ['fix/hide-settings']
  ),
  makeCommit(
    'b0307ff22c65df5d61a73457daa964c1f1cfd64d',
    [
      '2ee508f0b4ce51ddcfd579479100473925127035',
      'c27e421f99f9c37ca0aeaa02e108ad20ecb90852'
    ],
    'merge: TASK-205 Cancel no-refresh',
    5400,
    false
  ),
  makeCommit(
    'c27e421f99f9c37ca0aeaa02e108ad20ecb90852',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'fix(add-existing-repo): не инвалидируется кэш при отмене выбора',
    5700,
    false,
    ['fix/cancel-no-refresh']
  ),
  makeCommit(
    '2ee508f0b4ce51ddcfd579479100473925127035',
    [
      'f95262a02641eb6b6ab8e2e01033c5524b4e19b1',
      'b11bfae11c411480791c3674aa49a3578c9502e9'
    ],
    'merge: TASK-204 RepoCard align',
    6000,
    false
  ),
  makeCommit(
    'b11bfae11c411480791c3674aa49a3578c9502e9',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'fix(repo-card): размер репозитория выровнен по левому краю',
    6300,
    false,
    ['fix/repo-card']
  ),
  makeCommit(
    'f95262a02641eb6b6ab8e2e01033c5524b4e19b1',
    [
      '7b63d642aa4591512d90bdde8342ace98ca4054e',
      '313de33446d0c310465aa7c5b39a610b253c5afb'
    ],
    'merge: TASK-211 Toolbar styling',
    6600,
    false
  ),
  makeCommit(
    '313de33446d0c310465aa7c5b39a610b253c5afb',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'fix(workspace-toolbar): убраны фон и нижняя граница',
    6900,
    false,
    ['fix/workspace-toolbar']
  ),
  makeCommit(
    '7b63d642aa4591512d90bdde8342ace98ca4054e',
    [
      '5af3b48c2db78d04af0bc30e6118e52657a0e7dc',
      '8b12ac18498ac6e18652fb43d9414a604b2e947a'
    ],
    'merge: TASK-202 WorkspaceTile padding',
    7200,
    false
  ),
  makeCommit(
    '8b12ac18498ac6e18652fb43d9414a604b2e947a',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'fix(workspace-tile): добавлен отступ между размером и иконкой папки',
    7500,
    false,
    ['fix/workspace-tile']
  ),
  makeCommit(
    '5af3b48c2db78d04af0bc30e6118e52657a0e7dc',
    ['f029ef5bb5a6e9501e3665ac5805a5d0bf2d99fe'],
    'perf(repo-header): имя репозитория вычисляется из пути без лишних IPC',
    7800,
    false
  ),
  makeCommit(
    'f029ef5bb5a6e9501e3665ac5805a5d0bf2d99fe',
    ['5608417ebbbd994d1427765adb7fbf907aead280'],
    'fix(repo-page): шапка показывает только имя репозитория',
    8100,
    false
  ),
  makeCommit(
    '5608417ebbbd994d1427765adb7fbf907aead280',
    [],
    'chore(tasks): добавлены TASK-201..212 для багов roadmap-5',
    8400,
    false,
    ['main']
  )
];

const meta: Meta<typeof RepoGraph> = {
  title: 'widgets/RepoGraph',
  component: RepoGraph,
  decorators: [
    (Story) => (
      <div className="bg-background h-screen w-full">
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof RepoGraph>;

export const Dark: Story = {
  args: {
    commits: sampleCommits,
    layout: computeLayout(sampleCommits),
    selectedHash: '7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e',
    onSelect: () => {}
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="h-full w-full">
        <Story />
      </div>
    )
  ]
};

export const Light: Story = {
  args: {
    commits: sampleCommits,
    layout: computeLayout(sampleCommits),
    selectedHash: '7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e',
    onSelect: () => {}
  },
  decorators: [
    (Story) => (
      <div data-theme="light" className="h-full w-full">
        <Story />
      </div>
    )
  ]
};

export const Empty: Story = {
  args: {
    commits: [],
    selectedHash: null,
    onSelect: () => {}
  }
};

export const Loading: Story = {
  args: {
    commits: [],
    selectedHash: null,
    onSelect: () => {},
    isLoading: true
  }
};

export const Error: Story = {
  args: {
    commits: [],
    selectedHash: null,
    onSelect: () => {},
    isError: true
  }
};