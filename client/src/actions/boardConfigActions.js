import { CHANGE_CURRENT_BOARD_CONFIG, GET_BOARD_CONFIGS } from './types';
import { getBoards } from '../services/gameService';

export function getBoardConfigs() {
  return function(dispatch) {
    getBoards()
    .then(result => {
      dispatch({
        type: GET_BOARD_CONFIGS,
        payload: result
      })
    })
    .catch(err => console.log(err));
  }
}

export function changeCurrentBoardConfig(boardConfig) {
  return function(dispatch) {
    dispatch({
      type: CHANGE_CURRENT_BOARD_CONFIG,
      payload: boardConfig
    });
  }
}

// export const getBoardConfigs = dispatch => dispatch(_getBoardConfigs());