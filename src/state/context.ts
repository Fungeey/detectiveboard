import { createContext, useContext  } from 'react';

export enum UserMode{
  SELECT = 'select',
  CARD = 'card'
}

interface ContextType {
  userMode: UserMode,
  setUserMode?: React.Dispatch<React.SetStateAction<UserMode>> 
}

export const UserModeContext = createContext<ContextType>({
  userMode: UserMode.SELECT,
  setUserMode: undefined 
});

export const useGlobalContext = () => useContext(UserModeContext);