import { useEffect, useRef, useState } from "react";
import useScale from '../hooks/usescale';
import util from "../util";

const useMultiSelect = (data, onSelectItem) => {

  // when implementing useDrag, doStartDrag must return start position
  // function defaultDoStartDrag(mousePos, e){
  // return object's start position
  // }

  // doOnDrag and doEndDrag can be empty

  const [pos, setPos] = useState({ size:{x:0, y:0}, position:{ x: 0, y: 0 } });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [boundingsElements, setBoundingElements] = useState([]);

  // replace with useCallback?
  const firstUpdate = useRef(true);
  const scale = useScale();

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    window.addEventListener('blur', loseFocus, false);

    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', endDrag);
      window.removeEventListener('blur', loseFocus, false);
    }

  }, [offset]);

  function startDrag(e) {
    if(e.button != 0) return;
    e.stopPropagation();

    let p = util.getMousePos(e);
    let bounding = [];
    document.querySelectorAll(".itemWrapper").forEach(el => {
        bounding.push({bounding:el.getBoundingClientRect(),item:el});
    });
    setBoundingElements(bounding);

    setPos({size:{x:0, y:0}, position:p});
    setOffset(util.subPos(p, p));
    setStartPos(p);
    setIsSelecting(true)
  }

  const onDrag = util.throttle((e) => {
    let newPos = util.getMousePos(e);

    let selectRectangle = document.getElementById('select_box').getBoundingClientRect();
    boundingsElements.forEach(el=>{
        if(isColliding(selectRectangle, el.bounding)){
          //el.item.classList is DOMTokenList
          let isItemWrapper = Array.from(el.item.classList).filter(e=>e=="itemWrapper").length != 0;
          if(isItemWrapper){
            el.item = el.item.children[0];
          }
          if(onSelectItem) onSelectItem(el.item.getAttribute("uuid"));
        }
    })

    setPos({size:util.subPos(newPos, startPos), position:startPos});
  });

  function loseFocus() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  }

  function endDrag(e) {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);

    //Persistence because unselect elements when clickup
    let selectRectangle = document.getElementById('select_box').getBoundingClientRect();
    setTimeout(() => {
        boundingsElements.forEach(el=>{
            if(isColliding(selectRectangle, el.bounding)){
                if(onSelectItem) onSelectItem(el.item.getAttribute("uuid"));
            }
        })
    }, 50);

    setPos({size:{x:0, y:0}, position:{x:0, y:0}});

    setIsSelecting(false)
  }

  function isColliding(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  return [
    startDrag,
    pos,
    isSelecting
  ]
}

export default useMultiSelect; 