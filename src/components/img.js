import useItemBehavior from "../hooks/useitembehavior";
import util from "../util";

export default function Img({ props }) {

  const [render] = useItemBehavior(props);

  function renderItem(isSelected) {
    return <div
      style={{
        ...util.sizeStyle(props.item.size),
        backgroundImage: `url("${props.item.src}")`,
        resize: isSelected ? "both" : "none"
      }}
      className="imgItem"
    />
  }

  return render(renderItem);
}