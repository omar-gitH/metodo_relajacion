import { useMemo } from 'react';
import katex from 'katex';

interface MathTexProps {
  math: string;
  block?: boolean;
  className?: string;
}

export function MathTex({ math, block = false, className = '' }: MathTexProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`normal-case overflow-x-auto py-2.5 px-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`normal-case ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
