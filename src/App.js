import { useState  } from 'react';
import Board from './components/board';
import util from './util';
import { ActionsContext } from './state/context';

const App = () => {
  const [actionType, setActionType] = useState(util.actions.select);

  return (
    <ActionsContext.Provider value={{ actionType, setActionType }}>
      <Board/>
    </ActionsContext.Provider>)
}

export default App;