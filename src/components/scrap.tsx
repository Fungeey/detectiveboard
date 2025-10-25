import React, { useEffect, useState } from "react";
import useItemBehavior, { ItemProps } from "../hooks/useitembehavior";
import util from "../util";
import { ScrapItem } from "../types/index";

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

interface ScrapProps extends ItemProps {
  item: ScrapItem
}

export const Scrap: React.FC<ScrapProps> = React.memo(({
  item,
  debug,
  dispatch,
  getBoardPos,
  data
}) => {
  const {render} = useItemBehavior(item, dispatch, getBoardPos, data);
  const [font, setFont] = useState(getFont());
  const [effect, setEffect] = useState(getEffect());

  useEffect(() => {
    // timer();
  }, []);

  function getSize() {
    if (item.size)
      return util.sizeStyle(item.size);
    else
      return util.sizeStyle({ width:300, height:100 });
  }

  function getFont(): string {
    const rand = Math.round(Math.random() * fonts.length) - 1;
    return fonts[rand];
  }

  function getEffect() {
    const rand = Math.round(Math.random() * style.length) - 1;
    return style[rand];
  }

  async function timer() {
    await new Promise(resolve => setTimeout(resolve, 400));
    setFont(getFont());
    setEffect(getEffect());
    timer();
  }

  function renderItem() {
    return (
      <div
        style={{
          fontFamily: font,
          ...effect
        }}
        className="scrapItem">
        {item.text}
      </div>
    )
  }

  return render(renderItem);
});

export default Scrap;