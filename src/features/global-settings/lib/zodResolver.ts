import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { z } from 'zod';

export const zodResolver =
  <T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> =>
  async (values, _context, _options) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: FieldErrors<T> = {} as FieldErrors<T>;
    const bucket = errors as Record<string, { type: string; message: string }>;
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key !== 'string') continue;
      bucket[key] = { type: issue.code, message: issue.message };
    }

    return { values: {} as Record<string, never>, errors };
  };