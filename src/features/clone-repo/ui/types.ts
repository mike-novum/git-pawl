export type ActiveWorkspace = {
  id: string;
  name: string;
  path: string;
} | null;

export type CloneByUrlFormProps = {
  activeWorkspace: ActiveWorkspace;
  onSuccess?: (input: { url: string; destPath: string }) => void;
};

export type CloneByUrlFormValues = {
  url: string;
  destPath: string;
};
