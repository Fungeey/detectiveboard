import useItemBehavior from "../hooks/useitembehavior";
import util from "../util";

const Note = (props) => {
    const [renderItem] = useItemBehavior(props);

    function render(){
        return (
            <div className = "noteItem" style={util.sizeStyle(150, 100)}>
            {props.item.text}
            </div>)
    }

    return renderItem(render);
}

export default Note;
    