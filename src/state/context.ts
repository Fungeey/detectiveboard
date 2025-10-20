import { createContext, useContext  } from 'react';
import util from '../util';

export interface contextType {
  actionType: string,
  setActionType?: React.Dispatch<React.SetStateAction<string>> 
}

export const ActionsContext = createContext<contextType>({
  actionType: util.actions.select, 
  setActionType: undefined 
});

export const useGlobalContext = () => useContext(ActionsContext);