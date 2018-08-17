import { GET_BOARD_CONFIGS, CHANGE_CURRENT_BOARD_CONFIG } from '../actions/types';

/*
Co może być w global state?
 - cols, rows, bombs - wykorzystują je Game, Board i InfoPanel - App potrzebuje je do zrobienia stringa do bazy danych
 - tabKey - żeby komponenty wiedziały, że są visible i mogły zresetować swoje ustawienia


*/

const initialState = {
  currentBoardConfig: '20x20x70',
  boardConfigs: []
}

function boardConfig(state = initialState, action) {
  switch (action.type) {
    case GET_BOARD_CONFIGS:
      return {
        ...state,
        boardConfigs: action.payload
      };
    case CHANGE_CURRENT_BOARD_CONFIG:

      const configs = state.boardConfigs.slice();
      if (!configs.includes(action.payload)) {
        configs.push(action.payload);
      }
      
      return {
        ...state,
        boardConfigs: configs,
        currentBoardConfig: action.payload
      };
    default: 
      return state;
  }
}

export default boardConfig;