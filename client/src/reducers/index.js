import { combineReducers } from 'redux';
import boardConfig from './boardConfigReducer';

const rootReducer = combineReducers({
  boardConfig: boardConfig
});

export default rootReducer;