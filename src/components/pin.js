import util from "../util";

const pin = (props) => {

    const pinSize = 50;
    const offset = 10;

    function getPos() {
        if (props.pos) return props.pos;
        else return { x: 0, y: 0 };
    }

    return (
        <img className="pin" alt="thumbtack" src={require('../img/pin.png')}
            style={{
                ...util.posStyle(getPos()),
                width: pinSize, height: pinSize,
                left: -pinSize / 2 + offset,
                top: -pinSize / 2 + offset
            }} />
    )
}

export default pin;