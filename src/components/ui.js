import { useContext  } from 'react';
import useSaveLoad from '../hooks/usesaveload';
import util from '../util';
import { useGlobalContext } from '../state/context';

const UI = (props) => {

  // boardref is null when first run, since it it takes a bit for it to be set by Board.
  const [save, load] = useSaveLoad(props);
  
  const { actionType, setActionType } = useGlobalContext();

  // Icons source: https://fonts.google.com/icons

  function changeActionSelect(e){
    e.stopPropagation();
    changeAction(util.actions.select)
  }

  function changeActionCard(e){
    e.stopPropagation();
    changeAction(util.actions.card)
  }

  function changeAction(action){
    setActionType(action)
  }

  function undoDispatch(e){
    e.stopPropagation();
    if(props.allData.past.length != 0 && props.allData.past.length != 1) props.dispatch({ type: 'UNDO' });
  }

  function redoDispatch(e){
    e.stopPropagation();
    if(props.allData.past.length != 0) props.dispatch({ type: 'REDO' });
  }

  return (
    <div id={"ui"}>
      <div className={"UIGroup"}>
        <div className={`UIButton ${actionType == util.actions.select ? 'UIButtonSelect': ''}`} onClick={changeActionSelect}>
          <span className={"material-symbols-outlined"}>arrow_selector_tool</span>
          <div className={"UITooltip"}>
            <span className={"UITooltipText"}>Select</span>
          </div>
        </div>
        <div className={`UIButton ${actionType == util.actions.card ? 'UIButtonSelect': ''}`} onClick={changeActionCard}>
          <svg viewBox="0 0 24 24" fill="none" ><path fill="currentColor" fill-rule="evenodd" d="M5 2c-1.6568 0-3 1.3432-3 3v14c0 1.6569 1.3432 3 3 3h7c5.5228 0 10-4.4772 10-10v-7c0-1.6568-1.3431-3-3-3h-14Zm15 7v-4c0-.5523-.4477-1-1-1h-14c-.5523 0-1 .4477-1 1v14c0 .5523.4477 1 1 1v-.0039h4c1.6569 0 3-1.3432 3-3v-3.9961l1-1h4c1.6569 0 3-1.3431 3-3Zm-6.9523 10.932a4.9774 4.9774 0 0 0 .9523-2.9359v-2.9961h3a4.9774 4.9774 0 0 0 2.9316-.9492c-.4696 3.5789-3.3046 6.413-6.8839 6.8812Z" clip-rule="evenodd"></path></svg>
          <div className={"UITooltip"}>
            <span className={"UITooltipText"}>Card</span>
            <div className={"UIHotkeyGroup"}>
              <span className={"UIHotkey"}>x2 Click</span>
            </div>
          </div>
        </div>
      </div>
      <div className={"UIGroup"}>
        <div className={"UIButton"} onClick={load}>
          <span className={"material-symbols-outlined"}>download</span>
          <div className={"UITooltip"}>
            <span className={"UITooltipText"}>Import</span>
            <div className={"UIHotkeyGroup"}>
              <span className={"UIHotkey"}>CTRL</span>
              <span className={"UIHotkeySeparator"}>+</span>
              <span className={"UIHotkey"}>O</span>
            </div>
          </div>
        </div>
        <div className={"UIButton"} onClick={save}>
          <span className={"material-symbols-outlined"}>upload</span>
          <div className={"UITooltip"}>
            <span className={"UITooltipText"}>Export</span>
            <div className={"UIHotkeyGroup"}>
              <span className={"UIHotkey"}>CTRL</span>
              <span className={"UIHotkeySeparator"}>+</span>
              <span className={"UIHotkey"}>S</span>
            </div>
          </div>
        </div>
      </div>
      <div className={"UIGroup"}>
        <div className={`UIButton ${props.allData.past.length == 0 || props.allData.past.length == 1 ? 'UIButtonDisabled' : ''}`} onClick={undoDispatch}>
          <span className={"material-symbols-outlined"}>undo</span>
          <div className={"UITooltip"}>
            <span className={"UITooltipText"}>Undo</span>
            <div className={"UIHotkeyGroup"}>
              <span className={"UIHotkey"}>CTRL</span>
              <span className={"UIHotkeySeparator"}>+</span>
              <span className={"UIHotkey"}>Z</span>
            </div>
          </div>
        </div>
        <div className={`UIButton ${props.allData.future.length == 0 ? 'UIButtonDisabled' : ''}`} onClick={redoDispatch}>
        <span className={"material-symbols-outlined"}>redo</span>
          <div className={"UITooltip"}>
            <span className={"UITooltipText"}>Redo</span>
            <div className={"UIHotkeyGroup"}>
              <span className={"UIHotkey"}>CTRL</span>
              <span className={"UIHotkeySeparator"}>+</span>
              <span className={"UIHotkey"}>Y</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UI;