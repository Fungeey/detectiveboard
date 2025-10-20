import React, { useState  } from 'react';
import Board from './components/board';
import { UserMode, UserModeContext } from './state/context';

const App = () => {
  const [userMode, setUserMode] = useState(UserMode.SELECT);

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode }}>
      <Board/>
    </UserModeContext.Provider>)
}

export default App;