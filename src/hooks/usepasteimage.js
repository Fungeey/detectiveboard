import { useEffect } from "react";

const usePasteImage = (onPasteImage) => {
    useEffect(() => {
        document.onpaste = onPaste;
    }, []);

    // https://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c
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
            reader.onload = function(event) {
                // console.log(event.target.result); // data url!
                let imgSRC = event.target.result;
                onPasteImage(imgSRC);
            };

            reader.readAsDataURL(blob);
        }
    }
}
    
export default usePasteImage;