import React from 'react';
import useSaveLoad from '../hooks/usesaveload';
import { useGlobalContext, UserMode } from '../state/context';
import { State } from '../types/index';
import { OmniState } from '../hooks/undoable';
import { Action, ActionType } from '../state/boardstatereducer';

interface uiProps{
  allData: OmniState, 
  onLoad: (newData: State) => void,
  dispatch: React.Dispatch<Action> 
}

const UI: React.FC<uiProps> = ({
  allData,
  onLoad,
  dispatch
}) => {

  // boardref is null when first run, since it it takes a bit for it to be set by Board.
  const {save, load} = useSaveLoad(allData.present, onLoad);
  
  const { userMode, setUserMode } = useGlobalContext();

  // Icons source: https://fonts.google.com/icons

  function changeActionSelect(e: React.MouseEvent){
    e.stopPropagation();
    changeUserMode(UserMode.SELECT)
  }

  function changeActionCard(e: React.MouseEvent){
    e.stopPropagation();
    changeUserMode(UserMode.CARD)
  }

  function changeUserMode(userMode: UserMode){
    setUserMode?.(userMode);
  }

  function undoDispatch(e: React.MouseEvent){
    e.stopPropagation();
    if(allData.past.length !== 0 && allData.past.length !== 1) 
      dispatch({ type: ActionType.UNDO });
  }

  function redoDispatch(e: React.MouseEvent){
    e.stopPropagation();
    if(allData.past.length !== 0) 
      dispatch({ type: ActionType.REDO });
  }

  return (
    <div id={"ui"}>
      <div className={"UIGroup"}>
        <div className={`UIButton ${userMode === UserMode.SELECT ? 'UIButtonSelect': ''}`} onClick={changeActionSelect}>
          <span className={"material-symbols-outlined"}>arrow_selector_tool</span>
          <div className={"UITooltip"}>
            <span className={"UITooltipText"}>Select</span>
          </div>
        </div>
        <div className={`UIButton ${userMode === UserMode.CARD ? 'UIButtonSelect': ''}`} onClick={changeActionCard}>
          <svg viewBox="0 0 24 24" fill="none" ><path fill="currentColor" fillRule="evenodd" d="M5 2c-1.6568 0-3 1.3432-3 3v14c0 1.6569 1.3432 3 3 3h7c5.5228 0 10-4.4772 10-10v-7c0-1.6568-1.3431-3-3-3h-14Zm15 7v-4c0-.5523-.4477-1-1-1h-14c-.5523 0-1 .4477-1 1v14c0 .5523.4477 1 1 1v-.0039h4c1.6569 0 3-1.3432 3-3v-3.9961l1-1h4c1.6569 0 3-1.3431 3-3Zm-6.9523 10.932a4.9774 4.9774 0 0 0 .9523-2.9359v-2.9961h3a4.9774 4.9774 0 0 0 2.9316-.9492c-.4696 3.5789-3.3046 6.413-6.8839 6.8812Z" clipRule="evenodd"></path></svg>
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
        <div className={`UIButton ${allData.past.length === 0 || allData.past.length === 1 ? 'UIButtonDisabled' : ''}`} onClick={undoDispatch}>
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
        <div className={`UIButton ${allData.future.length === 0 ? 'UIButtonDisabled' : ''}`} onClick={redoDispatch}>
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