import util from "../util";

const useMouseEvents = (onLClick, onRClick) => {

    function onClick(e) {
        if (e.button == util.LMB && onLClick) onLClick();
        if (e.button == util.RMB && onRClick) onRClick();
    }

    return [
        onClick
    ]
}

export default useMouseEvents;