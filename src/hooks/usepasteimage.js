import { useEffect } from "react";
import util from '../util';

const usePasteImage = (onPasteImage) => {
    useEffect(() => {
        document.onpaste = onPaste;
    }, [onPasteImage]);

    // https://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c

    //http://jsfiddle.net/bt7BU/225/
    function onPaste(event) {
        // use event.originalEvent.clipboard for newer chrome versions
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;

        // find pasted image among pasted items
        var blob = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
                blob = items[i].getAsFile();
            }
        }

        // load image if there is a pasted image
        if (blob !== null) {
            var reader = new FileReader();
            reader.onload = async function (event) {
                // console.log(event.target.result); // data url!
                let imgSRC = event.target.result;

                let smallSRC = await util.downscaleImage(imgSRC, 500);
                onPasteImage(smallSRC);
            };

            reader.readAsDataURL(blob);
        }
    }
}

export default usePasteImage;

// https://stackoverflow.com/questions/21227078/convert-base64-to-image-in-javascript-jquery

// in order to save the layout with pictures:
// 1. convert to binary
// 2. save as file (in cache?)