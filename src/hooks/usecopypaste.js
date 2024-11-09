import { useEffect } from "react";

const useCopyPaste = (onCopy, onPaste) => {

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onCopy, onPaste]);

  function handleKeyPress(e) {
    if (e.ctrlKey && e.key === 'c') {
      if (onCopy) onCopy();
    } else if (e.ctrlKey && e.key === 'v') {
      if (onPaste) onPaste();
    }
  }
}

export default useCopyPaste;