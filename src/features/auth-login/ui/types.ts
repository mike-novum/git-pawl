import type { AccountProvider } from '@/entities/account';

export type ConnectAccountFormValues = {
  provider: AccountProvider;
  token: string;
  baseUrl: string;
};

export type ConnectAccountDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export type ConnectAccountFormProps = {
  onSuccess?: () => void;
};
