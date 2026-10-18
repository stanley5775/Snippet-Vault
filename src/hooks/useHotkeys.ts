import { useEffect, useRef } from 'react';
import { isButtonTarget, isTypingTarget, matches } from '@/lib/hotkeys';

export interface Hotkey {
  keys: string;
  run: (event: KeyboardEvent) => void;
  /** Fire even while focus is in a text field or the code editor. */
  allowInInputs?: boolean;
  /** Skip when a button or link has focus, so Enter keeps clicking it. */
  skipOnButtons?: boolean;
  /** Allow auto-repeat when the key is held. Off by default. */
  repeat?: boolean;
}

export function useHotkeys(bindings: Hotkey[], enabled = true) {
  const latest = useRef(bindings);

  useEffect(() => {
    latest.current = bindings;
  });

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return;
      const typing = isTypingTarget(event.target);
      const onButton = isButtonTarget(event.target);

      for (const binding of latest.current) {
        if (!matches(event, binding.keys)) continue;
        if (typing && !binding.allowInInputs) continue;
        if (onButton && binding.skipOnButtons) continue;
        if (event.repeat && !binding.repeat) continue;
        event.preventDefault();
        binding.run(event);
        return;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
