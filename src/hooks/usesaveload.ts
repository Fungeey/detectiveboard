import { useCallback, useEffect } from "react";
import tutorial from '../tutorial.json';
import { ItemType, State } from "../types/index";

export default function useSaveLoad(
  data: State,
  onLoad: (newState: State) => void
): {
  save: () => void,
  load: () => void
}{

  const checkData = useCallback((data) => {
    if (!data["items"]) err("items obj is missing");
    if (!data["lines"]) err("lines obj is missing");

    for (const uuid in data["items"]) {
      let item = data["items"][uuid];

      //Compatibility to old data
      if(item.type === ItemType.NOTE && item.isFrozen == null) 
        item.isFrozen = false 

      // oct 2025 migration: typescript update
      if(item.type === ItemType.IMG){
        item.imgSrc = item.src;
        item.src = undefined;
      }

      if (!item.pos) err(item.toString() + ": pos is missing");
      if ((!item.size || item.size) && (!item.size.width || !item.size.height)) {
        err("size is broken, reset to default");
        item.size = {
          width: 150,
          height: 100
        }
      }
    }

    for(const uuid in data["lines"]){
      const line = data["lines"][uuid];

      // oct 2025 migration: typescript update 
      line.startUuid = line.startRef;
      line.startRef = undefined;
      line.endUuid = line.endRef;
      line.endRef = undefined;

    }

  }, []);

  useEffect(() => {
    // if (false)

    checkData(tutorial);
    // onLoad(tutorial);
  }, [onLoad, checkData]);

  const save = useCallback(() => {
    checkData(data);
    const jsonData = JSON.stringify(data);

    download(jsonData, 'data.json', 'application/json');
  }, [checkData, data]);

  const forceLoad = useCallback(() => {
    async function load(e) {
      const file = e.target.files.item(0);
      const jsonData = await file.text();

      let data = JSON.parse(jsonData);
      checkData(data);
      onLoad(data);
    }

    const i = document.createElement("input");
    i.type = "file";
    i.onchange = load;
    i.click();
  }, [checkData, onLoad]);

  const handleCtrlS = useCallback((e: KeyboardEvent) => {

    if (e.ctrlKey && e.key === 's') {
      // Prevent the Save dialog open
      e.preventDefault();
      save();
    } else if (e.ctrlKey && e.key === 'o') {
      // Prevent the open dialog open
      e.preventDefault();

      forceLoad();
    }
  }, [save, forceLoad]);

  useEffect(() => {
    document.addEventListener('keydown', handleCtrlS);
    return () => document.removeEventListener('keydown', handleCtrlS);
  }, [handleCtrlS]);

  // https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
  function download(content, fileName: string, contentType: string) {
    let a = document.createElement("a");
    let file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  function err(msg: string) {
    console.log(msg);
  }

  return {save, load:forceLoad};
}