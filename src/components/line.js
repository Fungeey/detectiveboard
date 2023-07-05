import util from '../util'

const Line = (props) => {
    let offset = {x:10, y:10};
    let start = util.addPos(props.start, offset);
    let end = util.addPos(props.end, offset);
    let buffer = 5; // how much extra space to pad the svg area by
    let lineWidth = 5;

    const topLeft = () => ({
        x: Math.min(start.x, end.x) - buffer, 
        y:Math.min(start.y, end.y) - buffer});
        
    const svgWidth = () => Math.max(start.x, end.x) - Math.min(start.x, end.x) + buffer * 2;
    const svgHeight = () => Math.max(start.y, end.y) - Math.min(start.y, end.y) + buffer * 2;
    
    const lineStyle = () => ({
        stroke:"rgb(255,0,0, 1)", 
        strokeWidth:lineWidth, 
        fill:"transparent"
    });

    let x1 = start.x - topLeft().x;
    let y1 = start.y - topLeft().y;
    let x2 = end.x - topLeft().x;
    let y2 = end.y - topLeft().y;

    let tension = 1;
    let m1 = Math.abs((x1-x2)/2);
    let m2 = Math.max(y1,y2)*tension;

    return (
        <svg className='svgHolder' key = {props.uuid} width={svgWidth()}height={svgHeight()}
        style = {util.posStyle(topLeft())}>
            <path d={`M ${x1} ${y1} Q ${m1} ${m2} ${x2} ${y2}`} 
            style={lineStyle()}/>
        </svg>
    )
}

export default Line;