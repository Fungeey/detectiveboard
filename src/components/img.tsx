import React from 'react';
import useItemBehavior, { ItemProps } from "../hooks/useitembehavior";
import util from "../util";
import { ImageItem } from '../types/index';

interface ImageProps extends ItemProps {
  item: ImageItem 
}

export const Img: React.FC<ImageProps> = React.memo(({
  item,
  debug,
  dispatch,
  getBoardPos,
  data
}) => {
  const {render} = useItemBehavior(item, dispatch, getBoardPos, data);

  function renderItem() {
    return (
      <div
        style={{
          ...util.sizeStyle(item.size),
          backgroundImage: `url("${item.imgSrc}")`,
          resize: item.isSelected ? "both" : "none"
        }}
        className="imgItem"
      />
    )
  }

  // no special rendering for selection
  return render(renderItem);
});

export default Img;