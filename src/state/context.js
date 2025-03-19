import { createContext, useContext  } from 'react';

export const ActionsContext = createContext();

export const useGlobalContext = () => useContext(ActionsContext);