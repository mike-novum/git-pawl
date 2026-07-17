import type { ComponentProps } from 'react';

import type { Progress } from '@base-ui/react/progress';

export type ProgressRootProps = ComponentProps<typeof Progress.Root>;

export type ProgressIndicatorProps = ComponentProps<typeof Progress.Indicator>;

export type ProgressTrackProps = ComponentProps<typeof Progress.Track>;

export type ProgressValueProps = ComponentProps<typeof Progress.Value>;

export type ProgressLabelProps = ComponentProps<typeof Progress.Label>;
