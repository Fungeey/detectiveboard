import { useCallback, useEffect } from "react";
import util from '../util';

function usePasteImage(onPasteImage: (imgSRC: string) => void){

  // https://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c

  //http://jsfiddle.net/bt7BU/225/
  const onPaste = useCallback(async (e: ClipboardEvent) => {

    e.preventDefault();

    // Check if clipboard contains files
    const items = e.clipboardData?.files;
    if (!items || items.length === 0) return;

    // Loop through all files in clipboard
    for (let i = 0; i < items.length; i++) {
      // Handle only image files
      const file = items.item(i);
      if(!file) continue;

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        // When file is read, convert it to a Data URL
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          console.log("Image Data URL:", dataUrl);

          // const smallSRC = await util.downscaleImage(dataUrl, 500);
          onPasteImage(dataUrl);
        };

        // Read the pasted image as Data URL
        reader.readAsDataURL(file);
      }
    }

    // // use event.originalEvent.clipboard for newer chrome versions
    // const items = (event.clipboardData)// || event.originalEvent.clipboardData).items;

    // // find pasted image among pasted items
    // const blob = null;
    // for (let i = 0; i < items.length; i++) {
    //   if (items[i].type.indexOf("image") === 0) {
    //     blob = items[i].getAsFile();
    //   }
    // }

    // // load image if there is a pasted image
    // if (blob !== null) {
    //   var reader = new FileReader();
    //   reader.onload = async function (event) {
    //     // console.log(event.target.result); // data url!
    //     const imgSRC = event.target.result;

    //     const smallSRC = await util.downscaleImage(imgSRC, 500);
    //     onPasteImage(smallSRC);
    //   };

    //   reader.readAsDataURL(blob);
    // }
  }, [onPasteImage]);

  useEffect(() => {
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [onPaste]);
}

export default usePasteImage;

// https://stackoverflow.com/questions/21227078/convert-base64-to-image-in-javascript-jquery

// in order to save the layout with pictures:
// 1. convert to binary
// 2. save as file (in cache?)