import { useEffect } from "react";
const useSaveLoad = (ref) => {

    useEffect(() => {
        document.addEventListener('keydown', handleCtrlS);
        return () => document.removeEventListener('keydown', handleCtrlS);
    }, []);

    function handleCtrlS(e){
        if (e.ctrlKey && e.key === 's') {
            // Prevent the Save dialog open
            e.preventDefault();
            save();
        }else if (e.ctrlKey && e.key === 'o') {
            // Prevent the open dialog open
            e.preventDefault();
            forceLoad();
        }
    }

    function save(){
        let data = ref.current.data;
        let jsonData = JSON.stringify(data);

        download(jsonData, 'data.json', 'application/json');
    }

    // https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
    function download(content, fileName, contentType) {
        let a = document.createElement("a");
        let file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    function forceLoad(){
        let i = document.createElement("input");
        i.type = "file";
        i.onchange = load;
        i.click();
    }

    async function load(ev){
        console.log("chose file");
        const file = ev.target.files.item(0);
        const jsonData = await file.text();

        let data = JSON.parse(jsonData);
        ref.current.onLoad(data);
    }

    return [save, forceLoad];
}

export default useSaveLoad;