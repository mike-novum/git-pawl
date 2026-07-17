import type { Meta, StoryObj } from '@storybook/react';

import { Panel, PanelGroup, PanelResizeHandle } from './ResizablePanel';

const meta = {
  title: 'UI/ResizablePanel'
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="h-[260px] w-full">
      <PanelGroup orientation="horizontal">
        <Panel defaultSize={30} minSize={15}>
          <div className="bg-muted/40 p-4 text-sm">Sidebar</div>
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={70} minSize={30}>
          <div className="bg-background p-4 text-sm">Main content</div>
        </Panel>
      </PanelGroup>
    </div>
  )
};

export const Vertical: Story = {
  render: () => (
    <div className="h-[320px] w-[420px]">
      <PanelGroup orientation="vertical">
        <Panel defaultSize={25} minSize={10}>
          <div className="bg-muted/40 p-4 text-sm">Header</div>
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={50}>
          <div className="bg-background p-4 text-sm">Body</div>
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={25} minSize={10}>
          <div className="bg-muted/40 p-4 text-sm">Footer</div>
        </Panel>
      </PanelGroup>
    </div>
  )
};
