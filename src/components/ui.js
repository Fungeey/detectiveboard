import useSaveLoad from '../hooks/usesaveload';

const UI = (props) => {

    // boardref is null when first run, since it it takes a bit for it to be set by Board.
    const [save, load] = useSaveLoad(props);

    return(
        <div id={"ui"}>
        <br></br>
            <button className={"UIButton"} onClick={save}>save</button>
            <button className={"UIButton"} onClick={load}>load</button>
        </div>
    )
}

export default UI;