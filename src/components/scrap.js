import { useEffect, useState } from "react";
import useItemBehavior from "../hooks/useitembehavior";
import util from "../util";

const fonts = [
    "Trebuchet MS, Helvetica, sans-serif",
    "Copperplate, Papyrus, fantasy",
    "Georgia, serif",
    "Courier New, monospace"
]

const style = [
    { fontStyle: "italic" },
    { fontWeight: "bold" },
    { textDecoration: "underline" }
]

const Scrap = ({ props }) => {
    const [render] = useItemBehavior(props);
    const [font, setFont] = useState(getFont());
    const [effect, setEffect] = useState(getEffect());

    useEffect(() => {
        // timer();
    }, []);

    function getSize() {
        if (props.item.size)
            return util.sizeStyle(props.item.size);
        else
            return util.sizeStyle(300, 100);
    }

    function getFont() {
        let ind = Math.round(Math.random() * fonts.length) - 1;
        return fonts[ind];
    }

    function getEffect() {
        let ind = Math.round(Math.random() * style.length) - 1;
        return style[ind];
    }

    async function timer() {
        await new Promise(resolve => setTimeout(resolve, 400));
        setFont(getFont());
        setEffect(getEffect());
        timer();
    }

    function renderItem(isSelected) {
        return (
            <div
                style={{
                    fontFamily: font,
                    ...effect
                }}
                className="scrapItem">
                {props.item.text}
            </div>
        )
    }

    return render(renderItem);
}

export default Scrap;