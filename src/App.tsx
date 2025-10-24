import React, { useState  } from 'react';
import Board from './components/board';
import { UserMode, UserModeContext } from './state/context';
import useKeyDown from './hooks/usekeydown';
import useScale from './hooks/usescale';
import useMousePos from './hooks/usemousepos';
import usePointer from './hooks/usepointermove';

const App = () => {
  const [userMode, setUserMode] = useState(UserMode.SELECT);
  useKeyDown(() => {}, []);
  useScale();
  useMousePos(() => {});
  usePointer(() => {}, () => {});

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode }}>
      <Board/>
    </UserModeContext.Provider>
  )
}

export default App;