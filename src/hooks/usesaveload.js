import { useEffect } from "react";
import tutorial from '../tutorial.json';

const useSaveLoad = (props) => {

    useEffect(() => {
        document.addEventListener('keydown', handleCtrlS);
        return () => document.removeEventListener('keydown', handleCtrlS);
    }, [props.data]);


    useEffect(() => {
        loadTutorial();
    }, [])

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
        checkData(props.data);
        let jsonData = JSON.stringify(props.data);

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

    function loadTutorial(){
        props.onLoad(tutorial);
    }

    function forceLoad(){
        let i = document.createElement("input");
        i.type = "file";
        i.onchange = load;
        i.click();
    }

    async function load(ev){
        const file = ev.target.files.item(0);
        const jsonData = await file.text();

        let data = JSON.parse(jsonData);
        checkData(data);
        props.onLoad(data);
    }

    function checkData(data){
        if(!data["items"]) e("items obj is missing");
        if(!data["lines"]) e("lines obj is missing");

        for(const uuid in data["items"]){
            let item = data["items"][uuid];

            if(!item.pos) e(item, "pos is missing");
            if(item.size && (!item.size.width || !item.size.height)){
                e("size is broken, reset to default");
                item.size = {
                    width:200,
                    height:200
                }
            }
        }
    }

    function e(msg){
        console.log(msg);
    }

    return [save, forceLoad];
}

export default useSaveLoad;