import { useCallback, useEffect } from "react";

function useCopyPaste(
  onCopy: () => void, 
  onPaste: () => void
) {

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'c') {
      if (onCopy) onCopy();
    } else if (e.ctrlKey && e.key === 'v') {
      if (onPaste) onPaste();
    }
  }, [onCopy, onPaste]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onCopy, onPaste, handleKeyPress]);

}

export default useCopyPaste;