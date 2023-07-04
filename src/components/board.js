import { useState, useRef, useEffect} from 'react';
import { v4 as uuidv4 } from 'uuid';
import ContextMenu from './contextmenu';
import useDrag from './usedrag';
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

    // console.log(input.text);

    // useEffect(
    //     () => {
    //         console.log("text changed: " + input.text);
    //         if(input.finished){
    //             console.log(input);
    //             addNote(input.pos);
    //         }
    //     },
    //     [input.text]
    // );

    // Panning Board
    function startPan() {
        return pos;
    }

    function endPan(dist, e) {
        if(dist < 2 && e.button === 0){
            onClick(e, setInput, getBoardPos, input);
        }
    }

    function onClick(e, setInput, getBoardPos, input) {
        let pos = { x: e.clientX, y: e.clientY };
        setInput({
            pos: util.subPos(pos, getBoardPos()),
            text: ""
        });
        setIsCreating(true);
    
        const createNote = (e) => {
            if (e.key === "Enter") {
                // addnote is using the old value of input.text
                // useEffect to listen for the new value?
                // setState with callback?
                addNote(pos, input.text);
                setIsCreating(false);
                document.removeEventListener("keydown", createNote);
            }
    
            if (e.key === "Escape") {
                setIsCreating(false);
                document.removeEventListener("keydown", createNote);
            }
        };
    
        document.addEventListener("keydown", createNote);
    }

    // Add a new note
    function addNote(mouse, text){
        let pos = util.subPos(mouse, getBoardPos());

        let uuid = uuidv4();
        let noteCopy = {...notes};
        noteCopy[uuid] = {text:input.text, pos, uuid:uuid};
        setNotes(noteCopy);
        console.log("Created note: " + uuid);
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

        if(button !== 0) return;

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
            <input style = {{...util.posStyle(input.pos), position:'absolute'}} autoFocus={true} 
                onChange={(e) => setInput({pos: input.pos, text:e.target.value})}>
            </input>
            : <></>}

            {renderNotes(notes)}

            {lines.map((line) => <Line start={line.start} end={line.end} key={line.uuid}/>)}
        </div>
    </div>

    // currently Board has all note data
    // each note should hold its own data.

    function renderNotes(map){
        const notes = [];

        for(const uuid in map){
            let note = map[uuid];

            // TODO: change the render prop based upon what item it is.
            const render = (pos, onMouseDown) => (
                <div className = "note" style = {util.posStyle(pos)} onMouseDown={onMouseDown}
                /*onMouseEnter={() => onNoteEnter(note.uuid)} onMouseLeave={onNoteExit}*/>
                    {note.text}
                </div>
            );

            notes.push(
                <Note key={note.uuid} pos={note.pos} uuid={note.uuid} boardPos={getBoardPos} 
                update={updateNote} render={render} makeLine={makeLine}/>
            );
        }

        return notes;
    }
}

export default Board;