import useItemBehavior from "../hooks/useitembehavior";
import util from "../util";

const Img = (props) => {

    const [renderItem] = useItemBehavior(props);

    function render(){
        return (
            <img src={props.item.src}
            style={util.sizeStyle(400, null)}
            className="imgItem"
            draggable={false}
            />)
    }

    return renderItem(render);
}

export default Img;
    