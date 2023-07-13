import useSaveLoad from '../hooks/usesaveload';

const UI = (props) => {

    // boardref is null when first run, since it it takes a bit for it to be set by Board.
    const [save, load] = useSaveLoad(props);

    return(
        <div id={"ui"}>
            <div style={{
                display:"flex",
                flexDirection:"column"
            }}>
                <button className={"UIButton"} onClick={load}>import</button>
                <button className={"UIButton"} onClick={save}>export</button>
            </div>
        </div>
    )
}

export default UI;