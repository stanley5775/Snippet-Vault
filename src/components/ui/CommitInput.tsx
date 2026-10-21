'use client';

import { useId, useState } from 'react';

interface Props {
  id?: string;
  value: string;
  onCommit: (value: string) => void;
  /** Checked against the draft while typing. */
  validate?: (draft: string) => string | null;
  /** A problem with the saved value (shown when the draft matches it). */
  error?: string | null;
  className?: string;
  placeholder?: string;
  spellCheck?: boolean;
  'aria-label'?: string;
}

export function CommitInput({
  id,
  value,
  onCommit,
  validate,
  error,
  className,
  placeholder,
  spellCheck,
  'aria-label': ariaLabel,
}: Props) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  const errorId = useId();

  // When the saved value changes from outside (after a commit, or an undo), follow it.
  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }

  const message = validate?.(draft) ?? (draft === value ? error : null) ?? null;

  function commit() {
    if (draft !== value) onCommit(draft);
  }

  return (
    <div className="min-w-0">
      <input
        id={id}
        value={draft}
        placeholder={placeholder}
        spellCheck={spellCheck}
        aria-label={ariaLabel}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setDraft(value);
            e.currentTarget.blur();
          }
        }}
        className={className}
      />
      {message && (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {message}
        </p>
      )}
    </div>
  );
}
