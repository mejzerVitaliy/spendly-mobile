import { useCallback, useRef, useState } from 'react';

/**
 * Manages numeric keyboard visibility.
 *
 * Usage:
 *   const kb = useNumericKeyboard();
 *   <Pressable onPress={kb.open}>...</Pressable>
 *   <NumericKeyboard visible={kb.visible} onClose={kb.close} onClosed={kb.onClosed} />
 */
export function useNumericKeyboard() {
  const [visible, setVisible] = useState(false);
  // Blocks open() from firing during the close animation.
  // Guards against touch bleed-through (Android Modal quirk) where the tap
  // on the backdrop also hits the Pressable trigger below the Modal.
  const guardRef = useRef(false);
  const openRef = useRef(false);

  const open = useCallback(() => {
    if (!guardRef.current) {
      openRef.current = true;
      setVisible(true);
    }
  }, []);

  const close = useCallback(() => {
    if (openRef.current) {
      guardRef.current = true;
    }
    openRef.current = false;
    setVisible(false);
  }, []);

  // Pass to NumericKeyboard's onClosed — fires after animation ends.
  const onClosed = useCallback(() => {
    guardRef.current = false;
  }, []);

  return { visible, open, close, onClosed };
}
