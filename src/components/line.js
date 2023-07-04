import util from './util'

const Line = (props) => {
    let start = props.start;
    let end = props.end;
    let buffer = 5;
    let lineWidth = 5;

    const topLeft = () => ({
        x: Math.min(start.x, end.x) - buffer, 
        y:Math.min(start.y, end.y) - buffer});
        
    const svgWidth = () => Math.max(start.x, end.x) - Math.min(start.x, end.x) + buffer * 2;
    const svgHeight = () => Math.max(start.y, end.y) - Math.min(start.y, end.y) + buffer * 2;
    
    const lineStyle = () => ({stroke:"rgb(255,0,0)",strokeWidth:lineWidth});

    return (
        <svg className='svgHolder' key = {props.uuid} width={svgWidth()} height={svgHeight()}
        style = {util.posStyle(topLeft())}>
            <line 
                x1 = {start.x - topLeft().x} 
                y1 = {start.y - topLeft().y} 
                x2 = {end.x - topLeft().x} 
                y2 = {end.y - topLeft().y} 
                style={lineStyle()}>
            </line>
        </svg>
    )
}

export default Line;