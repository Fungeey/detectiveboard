import React, { useState  } from 'react';
import Board from './components/Board';
import { UserMode, UserModeContext } from './state/Context';
import useKeyDown from './hooks/useKeyDown';
import useScale from './hooks/useScale';
import useMousePos from './hooks/useMousePos';
import usePointer from './hooks/usePointerMove';

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