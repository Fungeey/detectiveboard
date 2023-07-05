


const pin = (props) => {
    
    const pinSize = 50;
    const offset = 10;

    return (
        <img className="pin" src={require('../img/pin.png')} 
        style={{
            position:'absolute', 
            width:pinSize, height:pinSize, 
            left:props.pos.x-pinSize/2+offset, 
            top:props.pos.y-pinSize/2+offset
        }}/>
    )
}

export default pin;