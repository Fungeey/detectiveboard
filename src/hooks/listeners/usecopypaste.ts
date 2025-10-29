import useKeyDown from "./usekeydown";

function useCopyPaste(
  onCopy: () => void, 
  onPaste: () => void
) {

  useKeyDown((e) => {
    if (e.ctrlKey && e.key === 'c') {
      onCopy?.();
    } else if (e.ctrlKey && e.key === 'v') {
      onPaste?.();
    }
  }, []);

}

export default useCopyPaste;