import type { Meta, StoryObj } from '@storybook/react';

import { Slider } from './Slider';

const meta = {
  title: 'UI/Slider',
  component: Slider.Root
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Slider.Root defaultValue={40}>
      <div className="flex items-center justify-between">
        <Slider.Label>Brightness</Slider.Label>
        <Slider.Value />
      </div>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Control>
    </Slider.Root>
  )
};

export const Range: Story = {
  render: () => (
    <Slider.Root defaultValue={[20, 80]}>
      <div className="flex items-center justify-between">
        <Slider.Label>Commit range</Slider.Label>
        <Slider.Value />
      </div>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
        </Slider.Track>
        <Slider.Thumb />
        <Slider.Thumb />
      </Slider.Control>
    </Slider.Root>
  )
};

export const Stepped: Story = {
  render: () => (
    <Slider.Root defaultValue={2} min={0} max={10} step={1}>
      <div className="flex items-center justify-between">
        <Slider.Label>Retries</Slider.Label>
        <Slider.Value />
      </div>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Control>
    </Slider.Root>
  )
};
