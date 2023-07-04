import { useState, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid';
import ContextMenu from './contextmenu';
import useDrag from './usedrag';
import useKeyDown from './usekeydown'
import util from './util';
import Line from './line';
import Note from './note';

const Board = () => {
    const [notes, setNotes] = useState({});
    const [lines, setLines] = useState([]);
    const boardRef = useRef(null);
    const [isCreating, setIsCreating] = useState(false);
    const [input, setInput] = useState({pos:{}, text:""});

    const getBoardPos = () => {
        let rect = boardRef.current.getBoundingClientRect();
        return {x:rect.left, y:rect.top};
    }

    // Panning Board
    function startPan() {
        return pos;
    }

    function endPan(dist, e) {
        if(dist < 2 && e.button === 0){
            onClick(e);
        }
    }

    function onClick(e) {
        // cancel out of creating, if clicked elsewhere
        if(isCreating && input.text == ""){
            setIsCreating(false);
            return;
        }

        // open text window, then 
        let pos = { x: e.clientX, y: e.clientY };
        setInput({
            pos: util.subPos(pos, getBoardPos()),
            text: ""
        });

        setIsCreating(true);
    }

    useKeyDown(() => {
        addNote();
        setInput({pos:{}, text:""});
        setIsCreating(false);
    }, ["Enter"]);

    useKeyDown(() => {
        setIsCreating(false);
    }, ["Escape"]);

    // Add a new note
    function addNote(){
        if(input.text === "" || input.pos == {})
            return;

        let uuid = uuidv4();
        let noteCopy = {...notes};
        noteCopy[uuid] = {text:input.text, pos:input.pos, uuid:uuid};
        setNotes(noteCopy);
    }

    const [pos, onMouseDown] = useDrag(startPan, null, endPan);

    function makeLine(uuid, endUuid){
        if(endUuid == null || endUuid === "")
            return;

        let line = {startRef:uuid, endRef:endUuid,
            start:notes[uuid].pos, end:notes[endUuid].pos,
            uuid:uuidv4()
        };

        addLine(line);
    }

    const addLine = (line) => {
        for(let i = 0; i < lines.length; i++){
            let other = lines[i];

            if(other.startRef === line.startRef && other.endRef === line.endRef){
                console.log("That line already exists");
                return;
            }
            if(other.startRef === line.endRef && other.startRef === line.endRef){
                console.log("That line already exists (backwards)");
                return;
            }
        }
        setLines([...lines, line]);
    }

    function updateNote(uuid, pos, button){
        let newNotes = {...notes};
        newNotes[uuid] = {...newNotes[uuid], pos:pos};
        setNotes(newNotes);

        // the note is being dragged, update the lines
        if(button === util.LMB) 
            updateLines(uuid, pos);    
    }

    // update the line to match the new note positions
    function updateLines(uuid, pos){
        let newLines = [...lines];
        newLines.forEach(line => {
            if(line.startRef === uuid)
                line.start = pos;
            if(line.endRef === uuid)
                line.end = pos;
        })
        setLines(newLines);
    }

    // Render
    return <div className='boardWrapper' onMouseDown = {onMouseDown}>        
        <div className='board' ref = {boardRef} style = {util.posStyle(pos)}>
            <ContextMenu/>
            <p style = {{position:'absolute'}}>board</p>

            {isCreating ? 
                <input style = {{...util.posStyle(input.pos), position:'absolute'}} autoFocus={true} onChange={(e) => setInput({pos: input.pos, text:e.target.value})}>
                </input>
            : <></>}

            {renderNotes()}

            {lines.map((line) => <Line start={line.start} end={line.end} key={line.uuid}/>)}
        </div>
    </div>

    function renderNotes(){
        const noteHTML = [];

        for(const uuid in notes){
            let note = notes[uuid];

            // note: pos, text, uuid
            noteHTML.push(
                <Note key={note.uuid} note={note} boardPos={getBoardPos} update={updateNote} makeLine={makeLine}/>
            );
        }

        return noteHTML;
    }
}

export default Board;