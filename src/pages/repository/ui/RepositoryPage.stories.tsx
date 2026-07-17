import type { Meta, StoryObj } from '@storybook/react';
import type { FC, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { RepositoryPage } from './RepositoryPage';

type DecoratorProps = {
  children: ReactNode;
  path: string;
};

const Router: FC<DecoratorProps> = ({ children, path }) => (
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/repo/:id" element={children} />
    </Routes>
  </MemoryRouter>
);

const meta: Meta<typeof RepositoryPage> = {
  title: 'Pages/Repository',
  component: RepositoryPage,
  decorators: [
    (Story) => (
      <div className="bg-background h-screen w-screen">
        <Router path="/repo/sample">
          <Story />
        </Router>
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
