import React, { useState  } from 'react';
import Board from './components/board';
import { UserMode, UserModeContext } from './state/context';
import { useMousePos } from './hooks/listeners';

const App = () => {
  const [userMode, setUserMode] = useState(UserMode.SELECT);

  // call hooks once to add listeners to document
  useMousePos()

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode }}>
      <Board/>
    </UserModeContext.Provider>
  )
}

export default App;