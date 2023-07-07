import './App.css';
import { useRef} from 'react';
import Board from './components/board';
import UI from './components/ui';

const App = () => {
  const boardRef = useRef({});

  return <div>
      <UI boardRef={boardRef}/>
      <Board board={boardRef}/>
  </div>
}

export default App;