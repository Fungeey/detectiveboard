import React, { useState } from 'react';
import Board from './components/board';
import { UserMode, UserModeContext } from './state/context';
import { useMousePos } from './hooks/listeners';

function getCaseIdFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  // Default to CASE_001 if missing
  return params.get('caseId') ?? 'CASE_001';
}

const App: React.FC = () => {
  const [userMode, setUserMode] = useState(UserMode.SELECT);

  // Call hooks once to add listeners to document
  useMousePos();

  const boardId = getCaseIdFromUrl();

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode }}>
      <Board boardId={boardId} />
    </UserModeContext.Provider>
  );
};

export default App;
