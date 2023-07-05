


const pin = (props) => {
    
    const pinSize = 50;
    const offset = 10;

    return (
        <img className="pin" src={require('../img/pin.png')} 
        style={{
            position:'absolute', 
            width:pinSize, height:pinSize, 
            left:-pinSize/2+offset, 
            top:-pinSize/2+offset
        }}/>
    )
}

export default pin;