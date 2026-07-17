export type AnsiColor = 'red' | 'green' | 'yellow';

export type AnsiToken = {
  text: string;
  color: AnsiColor | null;
};

export const parseAnsi = (input: string): AnsiToken[] => {
  const tokens: AnsiToken[] = [];
  let current: AnsiColor | null = null;
  let i = 0;
  let buffer = '';

  while (i < input.length) {
    if (input.charCodeAt(i) === 0x1b && input[i + 1] === '[') {
      const end = input.indexOf('m', i + 2);
      if (end === -1) {
        buffer += input[i];
        i += 1;
        continue;
      }

      if (buffer.length > 0) {
        tokens.push({ text: buffer, color: current });
        buffer = '';
      }

      const code = input.slice(i + 2, end);
      if (code === '0') {
        current = null;
      } else if (code === '31') {
        current = 'red';
      } else if (code === '32') {
        current = 'green';
      } else if (code === '33') {
        current = 'yellow';
      }

      i = end + 1;
    } else {
      buffer += input[i];
      i += 1;
    }
  }

  if (buffer.length > 0) {
    tokens.push({ text: buffer, color: current });
  }

  return tokens;
};
