
const useSaveLoad = (ref) => {

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

    async function load(ev){
        console.log("chose file");
        const file = ev.target.files.item(0);
        const jsonData = await file.text();

        let data = JSON.parse(jsonData);
        ref.current.onLoad(data);
    }

    return [save, load];
}

export default useSaveLoad;