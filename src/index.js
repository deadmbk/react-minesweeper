import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.css';

import Game from './Game';

const ROWS = 20;
const COLS = 20;
const BOMBS = 70;

ReactDOM.render(<Game rows={ROWS} cols={COLS} bombs={BOMBS} />, document.getElementById('root'));