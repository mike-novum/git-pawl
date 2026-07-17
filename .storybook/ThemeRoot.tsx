import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';

import type { StorybookTheme } from './types';

type ThemeRootProps = {
  mode: StorybookTheme;
  children: ReactNode;
};

export const ThemeRoot: FC<ThemeRootProps> = ({ mode, children }) => {
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return <>{children}</>;
};
