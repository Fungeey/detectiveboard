import useItemBehavior from "../hooks/useitembehavior";
import { useRef} from 'react';
import useKeyDown from '../hooks/usekeydown';
import util from "../util";

const Note = (props) => {
    const [renderItem] = useItemBehavior(props);
    const noteRef = useRef(null);

    function doubleClick(e){
        e.stopPropagation();
        noteRef.current.contentEditable = true;
    }

    useKeyDown(() => {
        noteRef.current.contentEditable = false;
    }, ["Enter", "Escape"]);

    function render(){
        return (
            <div className = "noteItem" style={util.sizeStyle(150, 100)} onDoubleClick={doubleClick} ref={noteRef}>
            {props.item.text}
            </div>)
    }

    return renderItem(render);
}

export default Note;
    