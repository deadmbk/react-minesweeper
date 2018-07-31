import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.css';

import Game from './Game';

const GAME_CONFIG = {
    rows: 20,
    cols: 20,
    bombs: 70
}

ReactDOM.render(<Game {...GAME_CONFIG} />, document.getElementById('root'));