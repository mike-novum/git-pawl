import type { Meta, StoryObj } from '@storybook/react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';

const meta = {
  title: 'UI/Table',
  parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const repos = [
  { name: 'git-pawl', branch: 'main', commits: 142, status: 'clean' },
  { name: 'web-client', branch: 'feature/auth', commits: 87, status: 'dirty' },
  { name: 'docs', branch: 'main', commits: 23, status: 'clean' }
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Repository</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead className="text-right">Commits</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {repos.map((repo) => (
          <TableRow key={repo.name}>
            <TableCell className="font-medium">{repo.name}</TableCell>
            <TableCell>{repo.branch}</TableCell>
            <TableCell className="text-right">{repo.commits}</TableCell>
            <TableCell>{repo.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
};

export const Compact: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File</TableHead>
          <TableHead className="text-right">Lines</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>README.md</TableCell>
          <TableCell className="text-right">42</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>index.ts</TableCell>
          <TableCell className="text-right">128</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>App.tsx</TableCell>
          <TableCell className="text-right">31</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
};
