import type { ReactNode } from 'react';

export type AppLayoutOutletContext = {
  setHeaderAction: (node: ReactNode | null) => void;
};