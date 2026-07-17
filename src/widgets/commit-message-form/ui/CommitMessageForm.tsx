import { useMemo, useState } from 'react';
import type { FC, FormEvent } from 'react';

import { cn } from '@/shared/lib/theme/cn';
import { Button, Checkbox, Input } from '@/shared/ui';

import type { CommitMessage, CommitMessageFormProps } from './types';

const HEADER_MAX_LENGTH = 72;

const TEXTAREA_CLASSES = cn(
  'border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
  'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'resize-y min-h-24 font-mono'
);

const BODY_TEXTAREA_CLASSES = cn(TEXTAREA_CLASSES, 'min-h-32');
const FOOTER_TEXTAREA_CLASSES = cn(TEXTAREA_CLASSES, 'min-h-20');

const buildMessage = (
  header: string,
  body: string,
  footer: string
): CommitMessage => {
  const trimmedBody = body.trim();
  const trimmedFooter = footer.trim();
  const message: CommitMessage = { header: header.trim() };

  if (trimmedBody) message.body = trimmedBody;
  if (trimmedFooter) message.footer = trimmedFooter;

  return message;
};

export const CommitMessageForm: FC<CommitMessageFormProps> = ({
  initialValues,
  isSubmitting = false,
  showBypass = false,
  showAmend = false,
  bypassChecked = false,
  className,
  onCommit,
  onBypassChange,
  onAmend
}) => {
  const [header, setHeader] = useState(initialValues?.header ?? '');
  const [body, setBody] = useState(initialValues?.body ?? '');
  const [footer, setFooter] = useState(initialValues?.footer ?? '');

  const headerLength = header.length;
  const headerTooLong = headerLength > HEADER_MAX_LENGTH;
  const headerEmpty = header.trim().length === 0;

  const canSubmit = useMemo(
    () => !isSubmitting && !headerEmpty && !headerTooLong,
    [isSubmitting, headerEmpty, headerTooLong]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    onCommit(buildMessage(header, body, footer));
  };

  const handleBypassChange = (checked: boolean): void => {
    onBypassChange?.(checked);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Commit message"
      className={cn('flex flex-col gap-4', className)}
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="commit-message-header"
          className="text-foreground text-sm font-medium"
        >
          Header
        </label>
        <Input
          id="commit-message-header"
          value={header}
          onChange={(event) => setHeader(event.target.value)}
          placeholder="feat: short summary"
          maxLength={HEADER_MAX_LENGTH}
          disabled={isSubmitting}
          aria-invalid={headerTooLong || undefined}
          aria-describedby="commit-message-header-counter"
        />
        <div
          id="commit-message-header-counter"
          aria-live="polite"
          className={cn(
            'text-muted-foreground flex items-center justify-between font-mono text-xs',
            headerTooLong && 'text-red-600 dark:text-red-400'
          )}
        >
          <span>Single line, up to {HEADER_MAX_LENGTH} characters.</span>
          <span data-testid="commit-message-header-count">
            {headerLength} / {HEADER_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="commit-message-body"
          className="text-foreground text-sm font-medium"
        >
          Body
        </label>
        <textarea
          id="commit-message-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Wrap at 72 chars. Use blank line to separate from header."
          disabled={isSubmitting}
          className={BODY_TEXTAREA_CLASSES}
          rows={6}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="commit-message-footer"
          className="text-foreground text-sm font-medium"
        >
          Footer
        </label>
        <textarea
          id="commit-message-footer"
          value={footer}
          onChange={(event) => setFooter(event.target.value)}
          placeholder="Refs, BREAKING CHANGE: notes."
          disabled={isSubmitting}
          className={FOOTER_TEXTAREA_CLASSES}
          rows={3}
        />
      </div>

      {showBypass ? (
        <Checkbox
          label="Bypass pre-commit and commit-msg hooks (--no-verify)"
          checked={bypassChecked}
          onCheckedChange={handleBypassChange}
          disabled={isSubmitting}
        />
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {showAmend ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onAmend}
            disabled={isSubmitting}
          >
            Amend
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          disabled={!canSubmit}
          loading={isSubmitting}
        >
          Commit
        </Button>
      </div>
    </form>
  );
};

CommitMessageForm.displayName = 'CommitMessageForm';