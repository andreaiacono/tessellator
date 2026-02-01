import { useEffect } from 'react';

interface KeyboardShortcuts {
  onSave?: () => void;
  onOpen?: () => void;
  onExport?: () => void;
}

export const useKeyboardShortcuts = ({ onSave, onOpen, onExport }: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd key
      const isModifier = e.ctrlKey || e.metaKey;

      if (isModifier && e.key === 's') {
        e.preventDefault();
        onSave?.();
      } else if (isModifier && e.key === 'o') {
        e.preventDefault();
        onOpen?.();
      } else if (isModifier && e.key === 'e') {
        e.preventDefault();
        onExport?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onOpen, onExport]);
};
